// backend/src/modules/solver/solver.client.ts
// HTTP client for communicating with the Python OR-Tools solver service

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OptimizeRequestDto,
  OptimizeResponseDto,
  OptimizeStatus,
} from '../../common/dto/optimize.dto';

interface SolverHealthResponse {
  status: string;
  version: string;
}

@Injectable()
export class SolverClient {
  private readonly logger = new Logger(SolverClient.name);
  private readonly solverUrl: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.solverUrl =
      this.configService.get<string>('SOLVER_URL') || 'http://localhost:8000';
    this.timeout =
      (this.configService.get<number>('SOLVER_TIMEOUT') || 30) * 1000;
  }

  /**
   * Send optimization request to solver service
   */
  async optimize(request: OptimizeRequestDto): Promise<OptimizeResponseDto> {
    const url = `${this.solverUrl}/optimize`;
    this.logger.debug(`Calling solver at ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.serializeRequest(request)),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Solver returned ${response.status}: ${errorBody}`,
        );
        throw new ServiceUnavailableException(
          `Solver error: ${response.statusText}`,
        );
      }

      const result = await response.json();
      return this.deserializeResponse(result);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          this.logger.error('Solver request timed out');
          return {
            status: OptimizeStatus.TIMEOUT,
            assignments: [],
            fitness: null,
            diagnostics: {
              relaxed: false,
              unsatCore: null,
              reason: `Solver timed out after ${this.timeout / 1000} seconds`,
            },
            suggestions: [
              {
                type: 'reduce_scope',
                description: 'Try reducing the date range or number of shifts',
              },
            ],
          };
        }

        if (error.message.includes('ECONNREFUSED')) {
          throw new ServiceUnavailableException(
            'Solver service is not available',
          );
        }
      }

      throw error;
    }
  }

  /**
   * Check solver service health
   */
  async healthCheck(): Promise<SolverHealthResponse> {
    const url = `${this.solverUrl}/health`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      this.logger.warn('Solver health check failed:', error);
      throw new ServiceUnavailableException('Solver service unavailable');
    }
  }

  /**
   * Serialize request to solver format (snake_case, etc.)
   */
  private serializeRequest(request: OptimizeRequestDto): object {
    return {
      team_id: request.teamId,
      date_from: request.dateFrom,
      date_to: request.dateTo,
      employees: request.employees.map((e) => ({
        id: e.id,
        skills: e.skills,
        availability: e.availability.map((a) => ({
          start: a.start,
          end: a.end,
          type: a.type,
        })),
        preferences: e.preferences,
      })),
      open_shifts: request.openShifts.map((s) => ({
        id: s.id,
        day: s.day,
        shift_code: s.shiftCode,
        required_skills: s.requiredSkills,
        duration_hours: s.durationHours,
        start_time: s.startTime,
        end_time: s.endTime,
      })),
      settings: {
        unassigned_penalty: request.settings.unassignedPenalty,
        max_shifts_per_day: request.settings.maxShiftsPerDay || 1,
        timeout_seconds: request.settings.timeoutSeconds || 30,
        weights: {
          preferred: request.settings.weights.preferred,
          neutral: request.settings.weights.neutral,
          avoided: request.settings.weights.avoided,
        },
      },
    };
  }

  /**
   * Deserialize solver response to DTO format (camelCase)
   */
  private deserializeResponse(response: any): OptimizeResponseDto {
    return {
      status: response.status as OptimizeStatus,
      assignments: (response.assignments || []).map((a: any) => ({
        shiftId: a.shift_id,
        employeeId: a.employee_id,
        start: a.start,
        end: a.end,
        notes: a.notes,
      })),
      fitness: response.fitness,
      diagnostics: {
        relaxed: response.diagnostics?.relaxed || false,
        unsatCore: response.diagnostics?.unsat_core || null,
        reason: response.diagnostics?.reason,
        minimalUnsat: response.diagnostics?.minimal_unsat,
        solveTimeMs: response.diagnostics?.solve_time_ms,
        totalShifts: response.diagnostics?.total_shifts,
        assignedShifts: response.diagnostics?.assigned_shifts,
        unfilledShifts: response.diagnostics?.unfilled_shifts,
      },
      suggestions: response.suggestions?.map((s: any) => ({
        type: s.type,
        description: s.description,
        impact: s.impact,
      })),
      relaxedSolution: response.relaxed_solution
        ? {
            status: response.relaxed_solution.status,
            assignments: response.relaxed_solution.assignments.map((a: any) => ({
              shiftId: a.shift_id,
              employeeId: a.employee_id,
              start: a.start,
              end: a.end,
              notes: a.notes,
            })),
            fitness: response.relaxed_solution.fitness,
            relaxedConstraints: response.relaxed_solution.relaxed_constraints,
          }
        : undefined,
    };
  }
}

