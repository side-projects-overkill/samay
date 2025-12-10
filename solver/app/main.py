# solver/app/main.py
# FastAPI entry point for the OR-Tools constraint solver service

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime

from .optimize import run_optimization, OptimizationResult
from .models import OptimizeRequest, OptimizeResponse

# Configure logging
log_level = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(
    level=getattr(logging, log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Samay Solver",
    description="OR-Tools CP-SAT constraint solver for workforce scheduling",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint for container orchestration."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "solver": "OR-Tools CP-SAT"
    }


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest) -> OptimizeResponse:
    """
    Run constraint-based optimization to assign employees to shifts.
    
    Uses Google OR-Tools CP-SAT solver with:
    - Hard constraints: skills, blackouts, max shifts per day
    - Soft constraints: preferences, availability types
    - Objective: maximize preference satisfaction, minimize unassigned shifts
    """
    logger.info(
        f"Optimization request: team={request.team_id}, "
        f"employees={len(request.employees)}, shifts={len(request.open_shifts)}"
    )
    
    try:
        result = run_optimization(request)
        
        logger.info(
            f"Optimization complete: status={result.status}, "
            f"fitness={result.fitness}, assigned={len(result.assignments)}"
        )
        
        return OptimizeResponse(
            status=result.status,
            assignments=result.assignments,
            fitness=result.fitness,
            diagnostics=result.diagnostics,
            suggestions=result.suggestions,
            relaxed_solution=result.relaxed_solution
        )
        
    except Exception as e:
        logger.exception("Optimization failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    """Root endpoint with API info."""
    return {
        "service": "Samay Solver",
        "description": "Workforce scheduling optimization using OR-Tools CP-SAT",
        "endpoints": {
            "/health": "Health check",
            "/optimize": "POST - Run optimization"
        }
    }

