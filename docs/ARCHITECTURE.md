# Samay Architecture Documentation

## Overview

Samay is a **dynamic workforce scheduling platform** built as a **Modular Monolith** architecture. It provides intelligent shift scheduling, availability management, and team organization with an AI-powered optimization engine.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Samay Platform                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Frontend  │    │   Backend   │    │   Solver    │    │  Database   │  │
│  │   (React)   │◄──►│  (NestJS)   │◄──►│  (FastAPI)  │    │ (PostgreSQL)│  │
│  │  Port 3000  │    │  Port 4000  │    │  Port 8000  │    │  Port 5432  │  │
│  └─────────────┘    └──────┬──────┘    └─────────────┘    └──────▲──────┘  │
│                            │                                      │         │
│                            └──────────────────────────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Frontend (React + TypeScript)

**Location:** `frontend/`

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- FullCalendar for scheduling views
- Zustand for state management
- React Router for navigation

**Key Features:**
- Role-based dashboards (Associate, Manager, SuperAdmin)
- Drag-and-drop roster builder
- Availability management grid
- Real-time updates via WebSocket

**Directory Structure:**
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx    # Main layout with sidebar
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Route pages
│   │   ├── LoginPage.tsx
│   │   ├── associate/    # Associate-only views
│   │   ├── manager/      # Manager views
│   │   └── admin/        # SuperAdmin views
│   ├── stores/           # Zustand state stores
│   │   ├── authStore.ts
│   │   └── rosterStore.ts
│   └── hooks/            # Custom React hooks
├── Containerfile.frontend
└── nginx.conf            # Production nginx config
```

---

### 2. Backend (NestJS + TypeScript)

**Location:** `backend/`

**Technology Stack:**
- NestJS (Node.js framework)
- TypeORM for database ORM
- PostgreSQL database
- Class-validator for DTOs
- Swagger/OpenAPI documentation

**Modular Monolith Architecture:**

```
backend/src/
├── modules/
│   ├── users/              # User & Team Management Module
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── team.entity.ts
│   │   │   └── skill.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── user-management.module.ts
│   │
│   ├── availability/       # Availability Management Module
│   │   ├── entities/
│   │   │   └── availability.entity.ts
│   │   ├── availability.controller.ts
│   │   └── availability.service.ts
│   │
│   ├── roster/             # Roster & Shift Management Module
│   │   ├── entities/
│   │   │   └── shift.entity.ts
│   │   ├── roster.controller.ts
│   │   ├── roster.service.ts
│   │   └── shifts.service.ts
│   │
│   └── solver/             # Solver Integration Module
│       ├── solver.client.ts
│       └── solver.module.ts
│
├── common/                 # Shared utilities
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── roles.guard.ts
│   │   └── team.guard.ts
│   └── dto/
│       └── optimize.dto.ts
│
├── config/
│   └── data-source.ts     # TypeORM configuration
│
├── app.module.ts          # Root module
└── main.ts                # Application entry
```

**Key Design Patterns:**
- **Module Boundaries:** Each domain has its own module with clear interfaces
- **Repository Pattern:** TypeORM repositories for data access
- **Optimistic Locking:** `@VersionColumn()` for concurrent shift updates
- **RBAC:** Role-based guards with `@Roles()` decorator

---

### 3. Solver (Python + FastAPI)

**Location:** `solver/`

**Technology Stack:**
- Python 3.11
- FastAPI web framework
- Google OR-Tools CP-SAT solver
- Poetry for dependency management
- Pydantic for data validation

**Directory Structure:**
```
solver/
├── app/
│   ├── main.py           # FastAPI application entry
│   ├── models.py         # Pydantic request/response models
│   └── optimize.py       # OR-Tools CP-SAT solver logic
├── tests/
│   └── test_optimize.py  # Solver unit tests
├── pyproject.toml        # Poetry configuration
└── Containerfile.solver
```

**Solver Algorithm:**

The solver uses Constraint Programming (CP-SAT) to optimize shift assignments:

```python
# Decision Variables
x[e, s] = Boolean  # 1 if employee e is assigned to shift s

# Hard Constraints
1. One employee per shift: Σ x[e,s] ≤ 1 for each shift s
2. Skill matching: x[e,s] = 0 if employee lacks required skills
3. Availability: x[e,s] = 0 if employee unavailable during shift
4. Max hours: Σ duration(s) * x[e,s] ≤ max_hours for each employee

# Soft Constraints (weighted in objective)
- Preference matching (higher weight for preferred slots)
- Fair distribution (minimize variance in hours)
- Minimize open shifts
```

**API Endpoints:**
- `POST /optimize` - Run optimization with given constraints
- `GET /health` - Health check endpoint

---

### 4. Database (PostgreSQL)

**Location:** Managed via `infra/podman-compose.yml`

**Entity Relationship Diagram:**

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      teams       │     │      users       │     │     skills       │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │◄────│ teamId (FK)      │     │ id (PK)          │
│ name             │     │ id (PK)          │────►│ code             │
│ description      │     │ email            │     │ name             │
│ managerId (FK)───│────►│ firstName        │     │ description      │
│ createdAt        │     │ lastName         │     └──────────────────┘
│ updatedAt        │     │ role (ENUM)      │
└──────────────────┘     │ managerId (FK)───│──┐  ┌──────────────────┐
                         │ skills (JSONB)   │  │  │  availabilities  │
                         │ maxHoursPerWeek  │  │  ├──────────────────┤
                         └──────────────────┘  │  │ id (PK)          │
                                               │  │ userId (FK)──────│──┐
┌──────────────────┐                           │  │ date             │  │
│      shifts      │                           │  │ type (ENUM)      │  │
├──────────────────┤                           │  │ startTime        │  │
│ id (PK)          │                           │  │ endTime          │  │
│ teamId (FK)──────│───────────────────────────┘  └──────────────────┘  │
│ date             │                                                     │
│ startTime        │                           ┌────────────────────────┘
│ endTime          │                           │
│ assignedUserId ──│───────────────────────────┘
│ status (ENUM)    │
│ version          │  ◄── Optimistic locking
│ requiredSkills   │
│ metadata (JSONB) │
└──────────────────┘
```

**Key Tables:**

| Table | Purpose |
|-------|---------|
| `users` | All system users (Associate, Manager, SuperAdmin) |
| `teams` | Organizational teams with manager assignments |
| `skills` | Skill definitions (e.g., "Forklift", "Customer Service") |
| `shifts` | Individual shift slots with assignment status |
| `availabilities` | Employee availability windows |

---

## Infrastructure

### Container Architecture

All services run as **rootless Podman containers** with non-root users:

```yaml
# infra/podman-compose.yml
services:
  db:        # PostgreSQL 16 Alpine
  backend:   # NestJS (Node 22 Alpine)
  solver:    # FastAPI (Python 3.11 Slim)
  frontend:  # Nginx Alpine serving React SPA
```

**Security Features:**
- Non-root container execution (`USER samay`)
- SELinux-compatible mounts (`:Z` flag)
- Health checks for all services
- No secrets in images

### Port Mapping

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Frontend | 8080 | 3000 |
| Backend | 4000 | 4000 |
| Solver | 8000 | 8000 |
| Database | 5432 | 5432 |

---

## Data Flow

### 1. User Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│ Frontend │────►│ Backend  │
└──────────┘     └──────────┘     └────┬─────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │   JWT    │
                                 │  Token   │
                                 └──────────┘
```

### 2. Roster Optimization Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Manager  │────►│ Frontend │────►│ Backend  │────►│  Solver  │
│  UI      │     │          │     │          │     │ (OR-Tools)│
└──────────┘     └──────────┘     └────┬─────┘     └────┬─────┘
                                       │                │
                                       ▼                │
                                 ┌──────────┐           │
                                 │ Database │◄──────────┘
                                 │(Shifts)  │   (Optimized assignments)
                                 └──────────┘
```

### 3. Optimization Request Payload

```json
{
  "team_id": "uuid",
  "date_range": { "start": "2024-01-15", "end": "2024-01-21" },
  "shifts": [...],        // Shifts to fill
  "employees": [...],     // Available employees with skills
  "availabilities": [...], // Employee availability windows
  "constraints": {
    "max_hours_per_employee": 40,
    "min_rest_hours": 11
  },
  "weights": {
    "preference_match": 10,
    "fair_distribution": 5
  }
}
```

---

## Role-Based Access Control (RBAC)

### User Roles

| Role | Capabilities |
|------|-------------|
| **Associate** | View own shifts, manage availability, view team |
| **Manager** | All Associate + manage team, build rosters, claim associates |
| **SuperAdmin** | All Manager + promote users, create teams, system admin |

### Role Hierarchy

```
SuperAdmin
    │
    ├── Promote Associate → Manager
    ├── Create/Delete Teams
    └── Reassign Managers
         │
         ▼
      Manager
         │
         ├── Claim Associates
         ├── Build Rosters
         └── Approve Availability
              │
              ▼
         Associate
              │
              ├── View Shifts
              ├── Set Availability
              └── Request Swaps
```

### Route Protection

```typescript
// Backend Guard Example
@UseGuards(RolesGuard)
@Roles('MANAGER', 'SUPERADMIN')
@Post('roster/optimize')
async triggerOptimization() { ... }
```

---

## API Design

### Backend API Structure

All API routes are prefixed with `/api/v1`:

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/auth/login` | Authenticate user | Public |
| `GET` | `/users` | List users | Manager+ |
| `GET` | `/users/me` | Current user profile | All |
| `POST` | `/teams` | Create team | SuperAdmin |
| `POST` | `/roster/optimize` | Trigger solver | Manager+ |
| `GET` | `/roster/shifts` | List shifts | All |
| `POST` | `/roster/shifts/:id/assign` | Assign shift | Manager+ |
| `GET` | `/availability` | List availabilities | All |
| `PUT` | `/availability` | Update availability | All |

### Solver API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/optimize` | Run CP-SAT optimization |
| `GET` | `/health` | Health check |

---

## Development Workflow

### Local Development

```bash
# Start all services
cd infra && podman-compose up -d

# View logs
podman-compose logs -f backend

# Rebuild single service
podman-compose build backend && podman-compose up -d backend

# Stop all
podman-compose down
```

### Testing

```bash
# Backend tests
cd backend && npm test

# Solver tests
cd solver && poetry run pytest

# Frontend tests
cd frontend && npm test
```

---

## Scalability Considerations

### Current State (MVP)
- Single instance per service
- SQLite-compatible schema (easy local dev)
- Synchronous solver calls

### Future Scaling Path

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Backend 1   │    │   Backend 2   │    │   Backend N   │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Redis Queue    │
                    │  (Bull/BullMQ)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Solver 1    │    │   Solver 2    │    │   Solver N    │
│  (Worker)     │    │  (Worker)     │    │  (Worker)     │
└───────────────┘    └───────────────┘    └───────────────┘
```

**Recommended Enhancements:**
1. Add Redis for session storage and job queues
2. Use BullMQ for async solver job processing
3. Add Kubernetes deployment manifests
4. Implement horizontal pod autoscaling

---

## Security Checklist

- [x] Non-root containers
- [x] Environment-based secrets (not hardcoded)
- [x] RBAC on all API endpoints
- [x] Input validation with DTOs
- [x] Optimistic locking for concurrent updates
- [ ] Rate limiting (TODO)
- [ ] Audit logging (TODO)
- [ ] HTTPS/TLS termination (TODO)

---

## File Reference

| Path | Description |
|------|-------------|
| `infra/podman-compose.yml` | Container orchestration |
| `backend/src/app.module.ts` | NestJS root module |
| `backend/src/modules/` | Domain modules |
| `solver/app/optimize.py` | CP-SAT solver logic |
| `frontend/src/App.tsx` | React router setup |
| `frontend/src/stores/authStore.ts` | Auth state management |
| `docs/ARCHITECTURE.md` | This document |

---

## Quick Commands Reference

```bash
# Start development stack
cd infra && podman-compose up -d

# View all logs
podman-compose logs -f

# Access endpoints
curl http://localhost:4000/api/v1/health    # Backend
curl http://localhost:8000/health           # Solver
open http://localhost:3000                  # Frontend

# Database access
podman exec -it samay_db psql -U samay -d samay

# Rebuild everything
podman-compose down && podman-compose build --no-cache && podman-compose up -d
```

---

*Document Version: 1.0.0*  
*Last Updated: December 2024*

