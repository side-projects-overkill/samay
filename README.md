# Samay — Dynamic Workforce Scheduling Platform

A modular monolith architecture for intelligent workforce scheduling using constraint-based optimization.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│    FullCalendar + Tailwind + Zustand + Socket.io                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (NestJS Monolith)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │UserManagement│ │ Availability │ │    Roster    │ │ Solver  │ │
│  │    Module    │ │    Module    │ │    Module    │ │ Client  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                                        │
         ▼                                        ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   PostgreSQL    │                    │  Solver (FastAPI +      │
│    Database     │                    │  OR-Tools CP-SAT)       │
└─────────────────┘                    └─────────────────────────┘
```

## Prerequisites

- Podman 4.0+ (rootless)
- podman-compose 1.0+
- Node.js 20+ (for local development)
- Python 3.11+ (for local solver development)

## Quick Start

### Build and Run with Podman

```bash
cd infra
make build
make up
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **Solver API**: http://localhost:8000 (internal)
- **API Docs**: http://localhost:4000/api/docs

### Run Migrations

```bash
make migrate
```

### Run Tests

```bash
# Backend tests
make test-backend

# Solver tests
make test-solver

# All tests
make test
```

## API Contract

### POST /api/v1/optimize

Triggers the constraint solver to generate optimal shift assignments.

**Request:**
```json
{
  "teamId": "uuid",
  "dateFrom": "2025-12-01",
  "dateTo": "2025-12-07",
  "employees": [
    {
      "id": "emp-uuid",
      "skills": ["skill_forklift", "skill_cashier"],
      "availability": [
        { "start": "2025-12-01T09:00:00+05:30", "end": "2025-12-01T13:00:00+05:30", "type": "PREFERRED" },
        { "start": "2025-12-01T13:00:00+05:30", "end": "2025-12-01T17:00:00+05:30", "type": "BLACKOUT" }
      ],
      "preferences": { "shift_morning": 10, "shift_evening": -5 }
    }
  ],
  "openShifts": [
    { "id": "shift-1", "day": "2025-12-01", "shiftCode": "shift_morning", "requiredSkills": ["skill_cashier"], "durationHours": 4 }
  ],
  "settings": {
    "unassignedPenalty": 100,
    "weights": { "preferred": 10, "neutral": 0, "avoided": -10 }
  }
}
```

**Response (Optimal):**
```json
{
  "status": "OPTIMAL",
  "assignments": [
    { "shiftId": "shift-1", "employeeId": "emp-uuid", "start": "2025-12-01T09:00:00+05:30", "end": "2025-12-01T13:00:00+05:30" }
  ],
  "fitness": 123,
  "diagnostics": { "relaxed": false, "unsatCore": null }
}
```

**Response (Infeasible):**
```json
{
  "status": "INFEASIBLE",
  "diagnostics": { "reason": "Insufficient staff with required skills", "minimalUnsat": ["need 2 forklift but have 1"] },
  "suggestions": ["relax_preference", "add_available_employee"]
}
```

## Project Structure

```
samay/
├── backend/                 # NestJS modular monolith
│   ├── src/
│   │   ├── modules/
│   │   │   ├── users/       # User management domain
│   │   │   ├── availability/# Availability domain
│   │   │   ├── roster/      # Roster & shifts domain
│   │   │   └── solver/      # Solver client
│   │   ├── common/          # Shared guards, decorators, DTOs
│   │   └── main.ts
│   └── test/
├── solver/                  # Python FastAPI + OR-Tools
│   ├── app/
│   │   ├── main.py
│   │   └── optimize.py
│   └── tests/
├── frontend/                # React + Tailwind + FullCalendar
│   └── src/
│       ├── components/
│       └── stores/
└── infra/                   # Podman orchestration
    ├── podman-compose.yml
    ├── Makefile
    └── examples/
```

## Security Features

- **Non-root containers**: All services run as unprivileged users
- **RBAC**: Role-based access control with `@Roles()` decorator
- **Team Guards**: Resource ownership verification
- **Optimistic Locking**: `@VersionColumn()` on Shift entity
- **SELinux**: `:Z` volume mounts for compatibility

## Development

### Local Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Local Solver Development

```bash
cd solver
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://samay:samay@db:5432/samay` | PostgreSQL connection string |
| `SOLVER_URL` | `http://solver:8000` | Solver service URL |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `NODE_ENV` | `development` | Environment mode |
| `SOLVER_TIMEOUT` | `30` | Max solver runtime in seconds |

## License

MIT

