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

- **Podman 4.0+** (rootless) with podman-compose
- **Node.js 22+** (for local development)
- **Python 3.11+** (for local solver development)

---

## 🚀 Quick Start with Podman

### Build and Start All Services

```bash
cd infra
podman-compose up -d --build
```

### Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| API Docs (Swagger) | http://localhost:4000/api/docs |
| Solver (internal) | http://localhost:8000 |

### Common Commands

```bash
# View logs
podman-compose logs -f

# View specific service logs
podman-compose logs -f backend
podman-compose logs -f solver
podman-compose logs -f frontend

# Stop all services
podman-compose down

# Stop and remove volumes (DESTRUCTIVE)
podman-compose down -v

# Rebuild a specific service
podman-compose build backend
podman-compose up -d backend

# Run database migrations
podman exec -it samay_backend npm run typeorm:migrate

# Access database shell
podman exec -it samay_db psql -U samay -d samay
```

---

## 🛠️ Running Services Individually (Development)

If you prefer to run services locally without containers:

### 1. Database (PostgreSQL)

```bash
# Start only the database container
cd infra
podman-compose up -d db

# Or use a local PostgreSQL installation
# Create database: samay, user: samay, password: samay
```

### 2. Backend (NestJS)

```bash
cd backend

# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="postgres://samay:samay@localhost:5432/samay"
export SOLVER_URL="http://localhost:8000"
export JWT_SECRET="your-secret-key"
export PORT=4000

# Run migrations
npm run typeorm:migrate

# Start in development mode (with hot reload)
npm run start:dev

# Or start in production mode
npm run build
npm run start:prod
```

### 3. Solver (Python FastAPI)

```bash
cd solver

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SOLVER_TIMEOUT=30
export LOG_LEVEL=info

# Start the solver
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables (optional, defaults work for local dev)
export VITE_API_URL="http://localhost:4000/api/v1"
export VITE_WS_URL="http://localhost:4000"

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
npm install
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report
```

### Solver Tests

```bash
cd solver
source venv/bin/activate
pip install -r requirements.txt
pytest -v
```

---

## API Contract

### POST /api/v1/roster/optimize

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

---

## Project Structure

```
samay/
├── backend/                 # NestJS modular monolith
│   ├── Containerfile.backend
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
│   ├── Containerfile.solver
│   ├── app/
│   │   ├── main.py
│   │   └── optimize.py
│   └── tests/
├── frontend/                # React + Tailwind + FullCalendar
│   ├── Containerfile.frontend
│   └── src/
│       ├── components/
│       └── stores/
└── infra/                   # Podman orchestration
    ├── podman-compose.yml
    └── examples/
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://samay:samay@db:5432/samay` | PostgreSQL connection string |
| `SOLVER_URL` | `http://solver:8000` | Solver service URL |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Environment mode |

### Solver

| Variable | Default | Description |
|----------|---------|-------------|
| `SOLVER_TIMEOUT` | `30` | Max solver runtime in seconds |
| `LOG_LEVEL` | `info` | Logging level |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | Backend API URL |
| `VITE_WS_URL` | `http://localhost:4000` | WebSocket URL |

---

## Security Features

- **Non-root containers**: All services run as unprivileged users
- **RBAC**: Role-based access control with `@Roles()` decorator
- **Team Guards**: Resource ownership verification
- **Optimistic Locking**: `@VersionColumn()` on Shift entity prevents race conditions
- **SELinux**: `:Z` volume mounts for compatibility

---

## License

MIT
