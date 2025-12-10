# solver/app/models.py
# Pydantic models for solver request/response

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class AvailabilityType(str, Enum):
    PREFERRED = "PREFERRED"
    NEUTRAL = "NEUTRAL"
    AVOIDED = "AVOIDED"
    BLACKOUT = "BLACKOUT"


class OptimizeStatus(str, Enum):
    OPTIMAL = "OPTIMAL"
    FEASIBLE = "FEASIBLE"
    INFEASIBLE = "INFEASIBLE"
    OPTIMAL_RELAXED = "OPTIMAL_RELAXED"
    TIMEOUT = "TIMEOUT"
    ERROR = "ERROR"


class AvailabilityWindow(BaseModel):
    start: str
    end: str
    type: AvailabilityType


class Employee(BaseModel):
    id: str
    skills: List[str]
    availability: List[AvailabilityWindow]
    preferences: Dict[str, int] = Field(default_factory=dict)


class OpenShift(BaseModel):
    id: str
    day: str
    shift_code: str
    required_skills: List[str]
    duration_hours: float
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class OptimizeWeights(BaseModel):
    preferred: int = 10
    neutral: int = 0
    avoided: int = -10


class OptimizeSettings(BaseModel):
    unassigned_penalty: int = 100
    max_shifts_per_day: int = 1
    timeout_seconds: int = 30
    weights: OptimizeWeights = Field(default_factory=OptimizeWeights)


class OptimizeRequest(BaseModel):
    team_id: str
    date_from: str
    date_to: str
    employees: List[Employee]
    open_shifts: List[OpenShift]
    settings: OptimizeSettings = Field(default_factory=OptimizeSettings)


class Assignment(BaseModel):
    shift_id: str
    employee_id: str
    start: str
    end: str
    notes: Optional[str] = None


class Diagnostics(BaseModel):
    relaxed: bool = False
    unsat_core: Optional[List[str]] = None
    reason: Optional[str] = None
    minimal_unsat: Optional[List[str]] = None
    solve_time_ms: Optional[int] = None
    total_shifts: Optional[int] = None
    assigned_shifts: Optional[int] = None
    unfilled_shifts: Optional[int] = None


class Suggestion(BaseModel):
    type: str
    description: str
    impact: Optional[str] = None


class RelaxedSolution(BaseModel):
    status: str
    assignments: List[Assignment]
    fitness: int
    relaxed_constraints: List[str]


class OptimizeResponse(BaseModel):
    status: OptimizeStatus
    assignments: List[Assignment]
    fitness: Optional[int] = None
    diagnostics: Diagnostics = Field(default_factory=Diagnostics)
    suggestions: Optional[List[Suggestion]] = None
    relaxed_solution: Optional[RelaxedSolution] = None

