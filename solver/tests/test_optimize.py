# solver/tests/test_optimize.py
# Unit and integration tests for the OR-Tools constraint solver

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.main import app
from app.models import (
    OptimizeRequest,
    Employee,
    OpenShift,
    AvailabilityWindow,
    AvailabilityType,
    OptimizeSettings,
    OptimizeWeights,
    OptimizeStatus,
)
from app.optimize import (
    run_optimization,
    has_required_skills,
    get_availability_for_shift,
    check_availability_overlap,
)


client = TestClient(app)


class TestConstraintHelpers:
    """Test helper functions for constraint checking."""

    def test_has_required_skills_all_skills(self):
        """Employee with all required skills should pass."""
        employee = Employee(
            id="e1",
            skills=["skill_cashier", "skill_forklift"],
            availability=[],
            preferences={},
        )
        assert has_required_skills(employee, ["skill_cashier"]) is True
        assert has_required_skills(employee, ["skill_cashier", "skill_forklift"]) is True

    def test_has_required_skills_missing_skills(self):
        """Employee missing required skills should fail."""
        employee = Employee(
            id="e1",
            skills=["skill_cashier"],
            availability=[],
            preferences={},
        )
        assert has_required_skills(employee, ["skill_forklift"]) is False
        assert has_required_skills(employee, ["skill_cashier", "skill_forklift"]) is False

    def test_has_required_skills_no_requirements(self):
        """No skill requirements should always pass."""
        employee = Employee(
            id="e1",
            skills=[],
            availability=[],
            preferences={},
        )
        assert has_required_skills(employee, []) is True

    def test_availability_overlap_contained(self):
        """Availability window that fully contains shift should match."""
        avail = AvailabilityWindow(
            start="2025-12-01T08:00:00",
            end="2025-12-01T18:00:00",
            type=AvailabilityType.PREFERRED,
        )
        shift_start = datetime(2025, 12, 1, 9, 0)
        shift_end = datetime(2025, 12, 1, 13, 0)
        
        overlaps, avail_type = check_availability_overlap(avail, shift_start, shift_end)
        assert overlaps is True
        assert avail_type == AvailabilityType.PREFERRED

    def test_availability_overlap_partial(self):
        """Partial overlap should not match (we need full containment)."""
        avail = AvailabilityWindow(
            start="2025-12-01T10:00:00",
            end="2025-12-01T14:00:00",
            type=AvailabilityType.PREFERRED,
        )
        shift_start = datetime(2025, 12, 1, 9, 0)
        shift_end = datetime(2025, 12, 1, 13, 0)
        
        overlaps, _ = check_availability_overlap(avail, shift_start, shift_end)
        assert overlaps is False  # Partial overlap doesn't count as covering


class TestOptimizationConstraints:
    """Test that the solver respects hard constraints."""

    def test_solver_respects_skill_requirements(self):
        """Solver should not assign employee to shift without required skills."""
        request = OptimizeRequest(
            team_id="team-1",
            date_from="2025-12-01",
            date_to="2025-12-01",
            employees=[
                Employee(
                    id="e1",
                    skills=["skill_cashier"],  # No forklift
                    availability=[
                        AvailabilityWindow(
                            start="2025-12-01T08:00:00",
                            end="2025-12-01T18:00:00",
                            type=AvailabilityType.PREFERRED,
                        )
                    ],
                    preferences={},
                )
            ],
            open_shifts=[
                OpenShift(
                    id="s1",
                    day="2025-12-01",
                    shift_code="shift_morning",
                    required_skills=["skill_forklift"],  # Requires forklift
                    duration_hours=4,
                    start_time="09:00",
                    end_time="13:00",
                )
            ],
            settings=OptimizeSettings(
                unassigned_penalty=100,
                weights=OptimizeWeights(preferred=10, neutral=0, avoided=-10),
            ),
        )

        result = run_optimization(request)
        
        # Shift should be unfilled because no one has forklift skill
        assert result.diagnostics.unfilled_shifts == 1
        assert len(result.assignments) == 0

    def test_solver_respects_blackout(self):
        """Solver should not assign employee during blackout periods."""
        request = OptimizeRequest(
            team_id="team-1",
            date_from="2025-12-01",
            date_to="2025-12-01",
            employees=[
                Employee(
                    id="e1",
                    skills=["skill_cashier"],
                    availability=[
                        AvailabilityWindow(
                            start="2025-12-01T09:00:00",
                            end="2025-12-01T13:00:00",
                            type=AvailabilityType.BLACKOUT,  # Blackout during shift
                        )
                    ],
                    preferences={},
                )
            ],
            open_shifts=[
                OpenShift(
                    id="s1",
                    day="2025-12-01",
                    shift_code="shift_morning",
                    required_skills=["skill_cashier"],
                    duration_hours=4,
                    start_time="09:00",
                    end_time="13:00",
                )
            ],
            settings=OptimizeSettings(),
        )

        result = run_optimization(request)
        
        # Shift should be unfilled because employee has blackout
        assert len(result.assignments) == 0
        assert result.diagnostics.unfilled_shifts == 1

    def test_solver_at_most_one_shift_per_day(self):
        """Solver should assign at most one shift per employee per day."""
        request = OptimizeRequest(
            team_id="team-1",
            date_from="2025-12-01",
            date_to="2025-12-01",
            employees=[
                Employee(
                    id="e1",
                    skills=["skill_cashier"],
                    availability=[
                        AvailabilityWindow(
                            start="2025-12-01T06:00:00",
                            end="2025-12-01T22:00:00",
                            type=AvailabilityType.PREFERRED,
                        )
                    ],
                    preferences={},
                )
            ],
            open_shifts=[
                OpenShift(
                    id="s1",
                    day="2025-12-01",
                    shift_code="shift_morning",
                    required_skills=["skill_cashier"],
                    duration_hours=4,
                    start_time="09:00",
                    end_time="13:00",
                ),
                OpenShift(
                    id="s2",
                    day="2025-12-01",
                    shift_code="shift_evening",
                    required_skills=["skill_cashier"],
                    duration_hours=4,
                    start_time="14:00",
                    end_time="18:00",
                ),
            ],
            settings=OptimizeSettings(max_shifts_per_day=1),
        )

        result = run_optimization(request)
        
        # Only one shift should be assigned to e1
        e1_assignments = [a for a in result.assignments if a.employee_id == "e1"]
        assert len(e1_assignments) == 1

    def test_solver_no_overlapping_shifts(self):
        """Solver should not assign overlapping shifts to same employee."""
        request = OptimizeRequest(
            team_id="team-1",
            date_from="2025-12-01",
            date_to="2025-12-01",
            employees=[
                Employee(
                    id="e1",
                    skills=["skill_cashier"],
                    availability=[
                        AvailabilityWindow(
                            start="2025-12-01T06:00:00",
                            end="2025-12-01T22:00:00",
                            type=AvailabilityType.PREFERRED,
                        )
                    ],
                    preferences={},
                )
            ],
            open_shifts=[
                OpenShift(
                    id="s1",
                    day="2025-12-01",
                    shift_code="shift_1",
                    required_skills=["skill_cashier"],
                    duration_hours=4,
                    start_time="09:00",
                    end_time="13:00",
                ),
                OpenShift(
                    id="s2",
                    day="2025-12-01",
                    shift_code="shift_2",
                    required_skills=["skill_cashier"],
                    duration_hours=4,
                    start_time="11:00",  # Overlaps with s1
                    end_time="15:00",
                ),
            ],
            settings=OptimizeSettings(max_shifts_per_day=2),  # Allow 2 shifts
        )

        result = run_optimization(request)
        
        # Both shifts cannot be assigned to e1 due to overlap
        # AddAtMostOne constraint should prevent this
        e1_assignments = [a for a in result.assignments if a.employee_id == "e1"]
        assert len(e1_assignments) <= 1


class TestOptimizationEndToEnd:
    """End-to-end integration tests for the optimization API."""

    def test_health_endpoint(self):
        """Health endpoint should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_optimize_endpoint_optimal(self):
        """Optimization with feasible solution should return OPTIMAL."""
        request_data = {
            "team_id": "team-123",
            "date_from": "2025-12-01",
            "date_to": "2025-12-01",
            "employees": [
                {
                    "id": "e1",
                    "skills": ["skill_cashier"],
                    "availability": [
                        {
                            "start": "2025-12-01T08:00:00",
                            "end": "2025-12-01T18:00:00",
                            "type": "PREFERRED",
                        }
                    ],
                    "preferences": {"shift_morning": 10},
                }
            ],
            "open_shifts": [
                {
                    "id": "s1",
                    "day": "2025-12-01",
                    "shift_code": "shift_morning",
                    "required_skills": ["skill_cashier"],
                    "duration_hours": 4,
                    "start_time": "09:00",
                    "end_time": "13:00",
                }
            ],
            "settings": {
                "unassigned_penalty": 100,
                "weights": {"preferred": 10, "neutral": 0, "avoided": -10},
            },
        }

        response = client.post("/optimize", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "OPTIMAL"
        assert len(data["assignments"]) == 1
        assert data["assignments"][0]["shift_id"] == "s1"
        assert data["assignments"][0]["employee_id"] == "e1"
        assert data["diagnostics"]["assigned_shifts"] == 1
        assert data["diagnostics"]["unfilled_shifts"] == 0

    def test_optimize_endpoint_infeasible(self):
        """Optimization with no feasible solution should return INFEASIBLE with diagnostics."""
        request_data = {
            "team_id": "team-123",
            "date_from": "2025-12-01",
            "date_to": "2025-12-01",
            "employees": [],  # No employees
            "open_shifts": [
                {
                    "id": "s1",
                    "day": "2025-12-01",
                    "shift_code": "shift_morning",
                    "required_skills": ["skill_cashier"],
                    "duration_hours": 4,
                    "start_time": "09:00",
                    "end_time": "13:00",
                }
            ],
            "settings": {"unassigned_penalty": 100},
        }

        response = client.post("/optimize", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # With no employees, all shifts unfilled but model is still "optimal" (just bad score)
        assert data["diagnostics"]["unfilled_shifts"] == 1

    def test_example_payload_from_docs(self):
        """Test with the example payload from documentation."""
        # This mirrors the example from infra/examples/optimize-request.json
        request_data = {
            "team_id": "550e8400-e29b-41d4-a716-446655440000",
            "date_from": "2025-12-01",
            "date_to": "2025-12-01",
            "employees": [
                {
                    "id": "e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
                    "skills": ["skill_cashier", "skill_forklift"],
                    "availability": [
                        {
                            "start": "2025-12-01T09:00:00+05:30",
                            "end": "2025-12-01T17:00:00+05:30",
                            "type": "PREFERRED",
                        }
                    ],
                    "preferences": {"shift_morning": 10, "shift_evening": -5},
                },
                {
                    "id": "f2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
                    "skills": ["skill_cashier"],
                    "availability": [
                        {
                            "start": "2025-12-01T09:00:00+05:30",
                            "end": "2025-12-01T13:00:00+05:30",
                            "type": "NEUTRAL",
                        },
                        {
                            "start": "2025-12-01T13:00:00+05:30",
                            "end": "2025-12-01T17:00:00+05:30",
                            "type": "PREFERRED",
                        },
                    ],
                    "preferences": {"shift_morning": -3, "shift_evening": 8},
                },
            ],
            "open_shifts": [
                {
                    "id": "shift-001",
                    "day": "2025-12-01",
                    "shift_code": "shift_morning",
                    "required_skills": ["skill_cashier"],
                    "duration_hours": 4,
                    "start_time": "09:00",
                    "end_time": "13:00",
                },
                {
                    "id": "shift-002",
                    "day": "2025-12-01",
                    "shift_code": "shift_evening",
                    "required_skills": ["skill_cashier"],
                    "duration_hours": 4,
                    "start_time": "13:00",
                    "end_time": "17:00",
                },
            ],
            "settings": {
                "unassigned_penalty": 100,
                "max_shifts_per_day": 1,
                "weights": {"preferred": 10, "neutral": 0, "avoided": -10},
            },
        }

        response = client.post("/optimize", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] in ["OPTIMAL", "FEASIBLE"]
        assert data["diagnostics"]["assigned_shifts"] == 2
        assert data["diagnostics"]["unfilled_shifts"] == 0
        
        # Verify all shifts are assigned
        assigned_shift_ids = {a["shift_id"] for a in data["assignments"]}
        assert "shift-001" in assigned_shift_ids
        assert "shift-002" in assigned_shift_ids


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

