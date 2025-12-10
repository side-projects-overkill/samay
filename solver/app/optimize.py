# solver/app/optimize.py
# OR-Tools CP-SAT constraint solver for workforce scheduling

import logging
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Tuple
from datetime import datetime, timedelta
from dateutil import parser as date_parser

from ortools.sat.python import cp_model

from .models import (
    OptimizeRequest,
    Employee,
    OpenShift,
    AvailabilityWindow,
    AvailabilityType,
    OptimizeStatus,
    Assignment,
    Diagnostics,
    Suggestion,
    RelaxedSolution,
)

logger = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """Result of the optimization run."""
    status: OptimizeStatus
    assignments: List[Assignment]
    fitness: Optional[int] = None
    diagnostics: Diagnostics = field(default_factory=Diagnostics)
    suggestions: Optional[List[Suggestion]] = None
    relaxed_solution: Optional[RelaxedSolution] = None


def parse_datetime(dt_str: str) -> datetime:
    """Parse ISO datetime string to datetime object."""
    return date_parser.isoparse(dt_str)


def get_shift_times(shift: OpenShift, day: str) -> Tuple[datetime, datetime]:
    """Get start and end datetime for a shift."""
    if shift.start_time and shift.end_time:
        start = datetime.fromisoformat(f"{day}T{shift.start_time}:00")
        end = datetime.fromisoformat(f"{day}T{shift.end_time}:00")
        # Handle overnight shifts
        if end <= start:
            end += timedelta(days=1)
    else:
        # Default to standard shift times based on code
        start = datetime.fromisoformat(f"{day}T09:00:00")
        end = start + timedelta(hours=shift.duration_hours)
    return start, end


def check_availability_overlap(
    avail: AvailabilityWindow,
    shift_start: datetime,
    shift_end: datetime
) -> Tuple[bool, AvailabilityType]:
    """
    Check if an availability window overlaps with a shift time.
    Returns (overlaps, availability_type).
    """
    avail_start = parse_datetime(avail.start)
    avail_end = parse_datetime(avail.end)
    
    # Check if availability window fully covers the shift
    if avail_start <= shift_start and avail_end >= shift_end:
        return True, avail.type
    
    return False, AvailabilityType.NEUTRAL


def has_required_skills(employee: Employee, required_skills: List[str]) -> bool:
    """Check if employee has all required skills for a shift."""
    employee_skills = set(employee.skills)
    return all(skill in employee_skills for skill in required_skills)


def get_availability_for_shift(
    employee: Employee,
    shift_start: datetime,
    shift_end: datetime
) -> Optional[AvailabilityType]:
    """Get the availability type for an employee during a shift."""
    for avail in employee.availability:
        overlaps, avail_type = check_availability_overlap(avail, shift_start, shift_end)
        if overlaps:
            return avail_type
    return None  # No availability defined


def run_optimization(request: OptimizeRequest) -> OptimizationResult:
    """
    Run the CP-SAT constraint solver to optimize shift assignments.
    
    Uses boolean decision variables x[e,s] indicating if employee e is assigned to shift s.
    
    Hard constraints:
    - Employee must have required skills for shift
    - Employee cannot work during BLACKOUT periods
    - Employee can work at most max_shifts_per_day per day
    - Each shift has at most one employee (or is left unfilled)
    
    Soft constraints (objective):
    - Prefer PREFERRED availability (+weight)
    - Neutral availability (0)
    - Penalize AVOIDED availability (-weight)
    - Penalize unfilled shifts (-unassigned_penalty)
    """
    start_time = time.time()
    
    # Build model
    model = cp_model.CpModel()
    
    employees = request.employees
    shifts = request.open_shifts
    settings = request.settings
    
    # Index employees and shifts by ID for quick lookup
    emp_by_id = {e.id: e for e in employees}
    shift_by_id = {s.id: s for s in shifts}
    
    # Group shifts by day
    shifts_by_day: Dict[str, List[OpenShift]] = {}
    for shift in shifts:
        if shift.day not in shifts_by_day:
            shifts_by_day[shift.day] = []
        shifts_by_day[shift.day].append(shift)
    
    # Decision variables: x[employee_id, shift_id] = 1 if employee is assigned to shift
    x: Dict[Tuple[str, str], cp_model.IntVar] = {}
    
    # Track which employees are eligible for which shifts
    eligible: Dict[str, List[str]] = {s.id: [] for s in shifts}  # shift_id -> [employee_ids]
    
    # Create variables only for valid employee-shift pairs
    for shift in shifts:
        shift_start, shift_end = get_shift_times(shift, shift.day)
        
        for emp in employees:
            # Check skill requirements
            if not has_required_skills(emp, shift.required_skills):
                logger.debug(f"Employee {emp.id} lacks skills for shift {shift.id}")
                continue
            
            # Check availability
            avail_type = get_availability_for_shift(emp, shift_start, shift_end)
            
            # BLACKOUT = hard constraint, skip variable creation
            if avail_type == AvailabilityType.BLACKOUT:
                logger.debug(f"Employee {emp.id} has BLACKOUT during shift {shift.id}")
                continue
            
            # Create decision variable
            var_name = f"x_{emp.id}_{shift.id}"
            x[(emp.id, shift.id)] = model.NewBoolVar(var_name)
            eligible[shift.id].append(emp.id)
    
    # Check if any solution is possible
    infeasible_shifts = [s.id for s in shifts if len(eligible[s.id]) == 0]
    
    # Variable for unfilled shifts (for objective)
    unfilled: Dict[str, cp_model.IntVar] = {}
    for shift in shifts:
        unfilled[shift.id] = model.NewBoolVar(f"unfilled_{shift.id}")
    
    # Constraint: Each shift is assigned to at most one employee OR is unfilled
    for shift in shifts:
        eligible_vars = [x[(e_id, shift.id)] for e_id in eligible[shift.id]]
        if eligible_vars:
            # Either one employee is assigned, or shift is unfilled
            model.Add(sum(eligible_vars) + unfilled[shift.id] == 1)
        else:
            # No eligible employees, shift must be unfilled
            model.Add(unfilled[shift.id] == 1)
    
    # Constraint: Employee works at most max_shifts_per_day per day
    for emp in employees:
        for day, day_shifts in shifts_by_day.items():
            day_vars = []
            for shift in day_shifts:
                if (emp.id, shift.id) in x:
                    day_vars.append(x[(emp.id, shift.id)])
            
            if day_vars:
                model.AddAtMostOne(day_vars)  # At most one shift per day
    
    # Constraint: No overlapping shifts for same employee
    for emp in employees:
        for day, day_shifts in shifts_by_day.items():
            # Check pairs of shifts that might overlap
            for i, shift1 in enumerate(day_shifts):
                for shift2 in day_shifts[i+1:]:
                    if (emp.id, shift1.id) in x and (emp.id, shift2.id) in x:
                        s1_start, s1_end = get_shift_times(shift1, day)
                        s2_start, s2_end = get_shift_times(shift2, day)
                        
                        # Check if shifts overlap
                        if s1_start < s2_end and s2_start < s1_end:
                            # Cannot be assigned to both
                            model.AddAtMostOne([
                                x[(emp.id, shift1.id)],
                                x[(emp.id, shift2.id)]
                            ])
    
    # Build objective function
    objective_terms = []
    
    for shift in shifts:
        shift_start, shift_end = get_shift_times(shift, shift.day)
        
        for emp_id in eligible[shift.id]:
            emp = emp_by_id[emp_id]
            var = x[(emp_id, shift.id)]
            
            # Get availability type weight
            avail_type = get_availability_for_shift(emp, shift_start, shift_end)
            if avail_type == AvailabilityType.PREFERRED:
                weight = settings.weights.preferred
            elif avail_type == AvailabilityType.AVOIDED:
                weight = settings.weights.avoided
            else:
                weight = settings.weights.neutral
            
            # Add employee preference for this shift code
            pref_weight = emp.preferences.get(shift.shift_code, 0)
            
            total_weight = weight + pref_weight
            objective_terms.append(total_weight * var)
    
    # Penalize unfilled shifts
    for shift in shifts:
        objective_terms.append(-settings.unassigned_penalty * unfilled[shift.id])
    
    # Maximize objective
    model.Maximize(sum(objective_terms))
    
    # Configure solver
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = settings.timeout_seconds
    solver.parameters.log_search_progress = logger.level <= logging.DEBUG
    
    # Solve
    status = solver.Solve(model)
    
    solve_time_ms = int((time.time() - start_time) * 1000)
    
    # Process results
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        assignments = []
        assigned_shifts = 0
        
        for shift in shifts:
            shift_start, shift_end = get_shift_times(shift, shift.day)
            
            for emp_id in eligible[shift.id]:
                if solver.Value(x[(emp_id, shift.id)]) == 1:
                    assignments.append(Assignment(
                        shift_id=shift.id,
                        employee_id=emp_id,
                        start=shift_start.isoformat(),
                        end=shift_end.isoformat()
                    ))
                    assigned_shifts += 1
                    break
        
        result_status = OptimizeStatus.OPTIMAL if status == cp_model.OPTIMAL else OptimizeStatus.FEASIBLE
        
        return OptimizationResult(
            status=result_status,
            assignments=assignments,
            fitness=int(solver.ObjectiveValue()),
            diagnostics=Diagnostics(
                relaxed=False,
                solve_time_ms=solve_time_ms,
                total_shifts=len(shifts),
                assigned_shifts=assigned_shifts,
                unfilled_shifts=len(shifts) - assigned_shifts
            )
        )
    
    elif status == cp_model.INFEASIBLE:
        # Try relaxed optimization
        logger.info("Primary optimization infeasible, attempting relaxed solve")
        relaxed_result = run_relaxed_optimization(request)
        
        # Build suggestions
        suggestions = build_suggestions(infeasible_shifts, eligible, emp_by_id, shift_by_id)
        
        # Build minimal unsat explanation
        minimal_unsat = []
        for shift_id in infeasible_shifts:
            shift = shift_by_id[shift_id]
            minimal_unsat.append(
                f"Shift {shift_id} requires skills {shift.required_skills} "
                f"but no available employee has them"
            )
        
        return OptimizationResult(
            status=OptimizeStatus.INFEASIBLE,
            assignments=[],
            fitness=None,
            diagnostics=Diagnostics(
                relaxed=False,
                reason="No feasible assignment exists with current constraints",
                minimal_unsat=minimal_unsat if minimal_unsat else None,
                solve_time_ms=solve_time_ms,
                total_shifts=len(shifts),
                assigned_shifts=0,
                unfilled_shifts=len(shifts)
            ),
            suggestions=suggestions,
            relaxed_solution=relaxed_result
        )
    
    else:  # UNKNOWN or other status (likely timeout)
        return OptimizationResult(
            status=OptimizeStatus.TIMEOUT,
            assignments=[],
            fitness=None,
            diagnostics=Diagnostics(
                relaxed=False,
                reason=f"Solver did not find solution within {settings.timeout_seconds}s",
                solve_time_ms=solve_time_ms,
                total_shifts=len(shifts)
            ),
            suggestions=[
                Suggestion(
                    type="reduce_scope",
                    description="Try reducing the date range or number of shifts",
                    impact="Faster solve time"
                )
            ]
        )


def run_relaxed_optimization(request: OptimizeRequest) -> Optional[RelaxedSolution]:
    """
    Run a relaxed optimization that ignores some soft constraints.
    Used when the primary optimization is infeasible.
    """
    try:
        # Create modified request with relaxed settings
        relaxed_settings = request.settings.model_copy()
        relaxed_settings.weights.avoided = 0  # Ignore AVOIDED preference
        relaxed_settings.unassigned_penalty = 10  # Lower penalty for unfilled
        
        # Create a new request with modified settings
        relaxed_request = OptimizeRequest(
            team_id=request.team_id,
            date_from=request.date_from,
            date_to=request.date_to,
            employees=request.employees,
            open_shifts=request.open_shifts,
            settings=relaxed_settings
        )
        
        # Run relaxed optimization with shorter timeout
        relaxed_request.settings.timeout_seconds = min(10, request.settings.timeout_seconds)
        
        model = cp_model.CpModel()
        employees = relaxed_request.employees
        shifts = relaxed_request.open_shifts
        settings = relaxed_request.settings
        
        emp_by_id = {e.id: e for e in employees}
        
        # Allow AVOIDED shifts (only block BLACKOUT)
        x: Dict[Tuple[str, str], cp_model.IntVar] = {}
        eligible: Dict[str, List[str]] = {s.id: [] for s in shifts}
        
        for shift in shifts:
            shift_start, shift_end = get_shift_times(shift, shift.day)
            
            for emp in employees:
                # Skip skill check for relaxed (but still enforce it)
                if not has_required_skills(emp, shift.required_skills):
                    continue
                
                avail_type = get_availability_for_shift(emp, shift_start, shift_end)
                if avail_type == AvailabilityType.BLACKOUT:
                    continue
                
                var_name = f"x_{emp.id}_{shift.id}"
                x[(emp.id, shift.id)] = model.NewBoolVar(var_name)
                eligible[shift.id].append(emp.id)
        
        unfilled: Dict[str, cp_model.IntVar] = {}
        for shift in shifts:
            unfilled[shift.id] = model.NewBoolVar(f"unfilled_{shift.id}")
        
        for shift in shifts:
            eligible_vars = [x[(e_id, shift.id)] for e_id in eligible[shift.id]]
            if eligible_vars:
                model.Add(sum(eligible_vars) + unfilled[shift.id] == 1)
            else:
                model.Add(unfilled[shift.id] == 1)
        
        # Max shifts per day
        shifts_by_day: Dict[str, List[OpenShift]] = {}
        for shift in shifts:
            if shift.day not in shifts_by_day:
                shifts_by_day[shift.day] = []
            shifts_by_day[shift.day].append(shift)
        
        for emp in employees:
            for day, day_shifts in shifts_by_day.items():
                day_vars = [x[(emp.id, s.id)] for s in day_shifts if (emp.id, s.id) in x]
                if day_vars:
                    model.AddAtMostOne(day_vars)
        
        # Simple objective: minimize unfilled
        model.Minimize(sum(unfilled.values()))
        
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = settings.timeout_seconds
        
        status = solver.Solve(model)
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            assignments = []
            for shift in shifts:
                shift_start, shift_end = get_shift_times(shift, shift.day)
                for emp_id in eligible[shift.id]:
                    if solver.Value(x[(emp_id, shift.id)]) == 1:
                        emp = emp_by_id[emp_id]
                        avail_type = get_availability_for_shift(emp, shift_start, shift_end)
                        notes = None
                        if avail_type == AvailabilityType.AVOIDED:
                            notes = "Assigned despite AVOIDED preference"
                        
                        assignments.append(Assignment(
                            shift_id=shift.id,
                            employee_id=emp_id,
                            start=shift_start.isoformat(),
                            end=shift_end.isoformat(),
                            notes=notes
                        ))
                        break
            
            return RelaxedSolution(
                status="OPTIMAL_RELAXED",
                assignments=assignments,
                fitness=int(-solver.ObjectiveValue()),  # Negate since we minimized
                relaxed_constraints=["avoided_preferences", "unassigned_penalty"]
            )
        
        return None
        
    except Exception as e:
        logger.warning(f"Relaxed optimization failed: {e}")
        return None


def build_suggestions(
    infeasible_shifts: List[str],
    eligible: Dict[str, List[str]],
    emp_by_id: Dict[str, Employee],
    shift_by_id: Dict[str, OpenShift]
) -> List[Suggestion]:
    """Build actionable suggestions based on infeasibility analysis."""
    suggestions = []
    
    # Suggest for shifts with no eligible employees
    for shift_id in infeasible_shifts:
        shift = shift_by_id[shift_id]
        suggestions.append(Suggestion(
            type="relax_skill_requirement",
            description=f"Remove or reduce skill requirements for shift {shift_id}: {shift.required_skills}",
            impact="May allow less qualified employees to fill the shift"
        ))
    
    # Check for understaffing
    total_shifts = len(shift_by_id)
    total_employees = len(emp_by_id)
    
    if total_shifts > total_employees:
        suggestions.append(Suggestion(
            type="add_available_employee",
            description=f"Add more employees ({total_shifts} shifts but only {total_employees} employees)",
            impact="Would enable better coverage"
        ))
    
    # Check for skill gaps
    all_required_skills: Set[str] = set()
    for shift in shift_by_id.values():
        all_required_skills.update(shift.required_skills)
    
    all_employee_skills: Set[str] = set()
    for emp in emp_by_id.values():
        all_employee_skills.update(emp.skills)
    
    missing_skills = all_required_skills - all_employee_skills
    if missing_skills:
        suggestions.append(Suggestion(
            type="train_employees",
            description=f"Train employees in missing skills: {list(missing_skills)}",
            impact="Would enable full shift coverage"
        ))
    
    return suggestions

