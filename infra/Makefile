# infra/Makefile
# Build and orchestration commands for Samay platform using Podman

.PHONY: build up down logs migrate test test-backend test-solver clean prune shell-backend shell-solver

# Default target
all: build up

# Build all container images
build:
	@echo "🔨 Building Samay containers..."
	podman-compose build

# Build individual services
build-backend:
	podman-compose build backend

build-solver:
	podman-compose build solver

build-frontend:
	podman-compose build frontend

# Start all services
up:
	@echo "🚀 Starting Samay services..."
	podman-compose up -d
	@echo "✅ Services started:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:4000/api/v1"
	@echo "   API Docs: http://localhost:4000/api/docs"

# Start in foreground (for debugging)
up-fg:
	podman-compose up

# Stop all services
down:
	@echo "🛑 Stopping Samay services..."
	podman-compose down

# Stop and remove volumes (DESTRUCTIVE)
down-clean:
	@echo "⚠️  Stopping services and removing volumes..."
	podman-compose down -v

# View logs
logs:
	podman-compose logs -f

logs-backend:
	podman-compose logs -f backend

logs-solver:
	podman-compose logs -f solver

logs-frontend:
	podman-compose logs -f frontend

# Run database migrations
migrate:
	@echo "📦 Running database migrations..."
	podman exec -it samay_backend npm run typeorm:migrate

# Generate new migration
migration-generate:
	@echo "📝 Generating migration..."
	podman exec -it samay_backend npm run typeorm:generate -- -n $(name)

# Run tests
test: test-backend test-solver

test-backend:
	@echo "🧪 Running backend tests..."
	podman exec -it samay_backend npm run test

test-solver:
	@echo "🧪 Running solver tests..."
	podman exec -it samay_solver pytest -v

test-e2e:
	@echo "🧪 Running end-to-end tests..."
	podman exec -it samay_backend npm run test:e2e

# Interactive shells
shell-backend:
	podman exec -it samay_backend /bin/sh

shell-solver:
	podman exec -it samay_solver /bin/sh

shell-db:
	podman exec -it samay_db psql -U samay -d samay

# Check service health
health:
	@echo "🏥 Checking service health..."
	@curl -sf http://localhost:4000/api/v1/health && echo "Backend: ✅" || echo "Backend: ❌"
	@curl -sf http://localhost:8000/health && echo "Solver: ✅" || echo "Solver: ❌"
	@curl -sf http://localhost:3000 > /dev/null && echo "Frontend: ✅" || echo "Frontend: ❌"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	podman-compose down --rmi local

prune:
	@echo "🗑️  Pruning unused Podman resources..."
	podman system prune -f

# Development helpers
dev-backend:
	cd ../backend && npm run start:dev

dev-solver:
	cd ../solver && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd ../frontend && npm run dev

# Quick rebuild and restart a single service
restart-backend: build-backend
	podman-compose up -d backend

restart-solver: build-solver
	podman-compose up -d solver

restart-frontend: build-frontend
	podman-compose up -d frontend

