// backend/src/modules/roster/roster.service.ts
// Service implementing roster operations including solver integration

import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift, ShiftStatus } from './entities/shift.entity';
import { User } from '../users/entities/user.entity';
import { Team } from '../users/entities/team.entity';
import { Availability } from '../availability/entities/availability.entity';
import { SolverClient } from '../solver/solver.client';
import { ShiftsService } from './shifts.service';
import {
  OptimizeRequestDto,
  OptimizeResponseDto,
  EmployeeDto,
  OpenShiftDto,
  OptimizeStatus,
  AvailabilityTypeDto,
} from '../../common/dto/optimize.dto';

@Injectable()
export class RosterService {
  private readonly logger = new Logger(RosterService.name);

  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly solverClient: SolverClient,
    private readonly shiftsService: ShiftsService,
  ) {}

  /**
   * Trigger optimization with a pre-built payload
   */
  async triggerOptimization(
    request: OptimizeRequestDto,
  ): Promise<OptimizeResponseDto> {
    this.logger.log(
      `Triggering optimization for team ${request.teamId} (${request.dateFrom} to ${request.dateTo})`,
    );

    try {
      const response = await this.solverClient.optimize(request);

      this.logger.log(
        `Optimization completed: ${response.status}, fitness: ${response.fitness}`,
      );

      return response;
    } catch (error) {
      this.logger.error('Solver error:', error);
      throw new InternalServerErrorException(
        `Solver failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Auto-build optimization payload from database state and trigger solver
   */
  async autoOptimize(
    teamId: string,
    from: string,
    to: string,
  ): Promise<OptimizeResponseDto> {
    this.logger.log(`Auto-optimizing team ${teamId} from ${from} to ${to}`);

    // Fetch team with members
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members', 'members.skills'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    // Build employee DTOs
    const employees = await this.buildEmployeeDtos(team.members, from, to);

    // Fetch open shifts
    const shifts = await this.shiftRepository.find({
      where: {
        teamId,
        status: ShiftStatus.OPEN,
      },
    });

    // Filter shifts in date range
    const filteredShifts = shifts.filter(
      (s) => s.date >= from && s.date <= to,
    );

    // Build open shift DTOs
    const openShifts: OpenShiftDto[] = filteredShifts.map((s) => ({
      id: s.id,
      day: s.date,
      shiftCode: s.shiftCode,
      requiredSkills: s.requiredSkills,
      durationHours: Number(s.durationHours),
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    // Get team settings or use defaults
    const settings = {
      unassignedPenalty: 100,
      maxShiftsPerDay: team.settings?.maxShiftsPerDay || 1,
      weights: {
        preferred: 10,
        neutral: 0,
        avoided: -10,
      },
    };

    const request: OptimizeRequestDto = {
      teamId,
      dateFrom: from,
      dateTo: to,
      employees,
      openShifts,
      settings,
    };

    return this.triggerOptimization(request);
  }

  /**
   * Apply optimization results to the database
   */
  async applyOptimization(
    response: OptimizeResponseDto,
  ): Promise<{ applied: number; failed: number }> {
    if (
      response.status !== OptimizeStatus.OPTIMAL &&
      response.status !== OptimizeStatus.FEASIBLE
    ) {
      this.logger.warn(
        `Cannot apply non-optimal solution: ${response.status}`,
      );
      return { applied: 0, failed: 0 };
    }

    let applied = 0;
    let failed = 0;

    for (const assignment of response.assignments) {
      try {
        await this.shiftsService.assign(
          assignment.shiftId,
          assignment.employeeId,
          'solver',
        );
        applied++;
      } catch (error) {
        this.logger.warn(
          `Failed to apply assignment for shift ${assignment.shiftId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        failed++;
      }
    }

    this.logger.log(
      `Applied optimization: ${applied} successful, ${failed} failed`,
    );

    return { applied, failed };
  }

  /**
   * Get calendar view for team
   */
  async getCalendarView(teamId: string, from: string, to: string) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    // Get all shifts in range
    const shifts = await this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.assignedUser', 'assignedUser')
      .where('shift.teamId = :teamId', { teamId })
      .andWhere('shift.date >= :from', { from })
      .andWhere('shift.date <= :to', { to })
      .orderBy('shift.date', 'ASC')
      .addOrderBy('shift.startTime', 'ASC')
      .getMany();

    // Transform to calendar events
    const events = shifts.map((s) => ({
      id: s.id,
      title: s.assignedUser
        ? `${s.assignedUser.firstName} ${s.assignedUser.lastName}`
        : 'Open Shift',
      start: s.startDateTime.toISOString(),
      end: s.endDateTime.toISOString(),
      backgroundColor: this.getShiftColor(s.status),
      borderColor: this.getShiftColor(s.status),
      extendedProps: {
        shiftId: s.id,
        shiftCode: s.shiftCode,
        status: s.status,
        assignedUserId: s.assignedUserId,
        requiredSkills: s.requiredSkills,
        version: s.version,
      },
    }));

    // Get team members for external events
    const members = team.members.map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      role: m.role,
    }));

    return {
      events,
      members,
      meta: {
        teamId,
        teamName: team.name,
        from,
        to,
        totalShifts: shifts.length,
        openShifts: shifts.filter((s) => s.status === ShiftStatus.OPEN).length,
        assignedShifts: shifts.filter((s) => s.status === ShiftStatus.ASSIGNED)
          .length,
      },
    };
  }

  /**
   * Build employee DTOs with availability for solver
   */
  private async buildEmployeeDtos(
    users: User[],
    from: string,
    to: string,
  ): Promise<EmployeeDto[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1); // Include end date

    const employees: EmployeeDto[] = [];

    for (const user of users) {
      // Get availability for this user in date range
      const availabilities = await this.availabilityRepository
        .createQueryBuilder('a')
        .where('a.userId = :userId', { userId: user.id })
        .andWhere('a.startTime >= :from', { from: fromDate })
        .andWhere('a.endTime <= :to', { to: toDate })
        .orderBy('a.startTime', 'ASC')
        .getMany();

      employees.push({
        id: user.id,
        skills: user.skills?.map((s) => s.code) || [],
        availability: availabilities.map((a) => ({
          start: a.startTime.toISOString(),
          end: a.endTime.toISOString(),
          type: a.type as unknown as AvailabilityTypeDto,
        })),
        preferences: user.shiftPreferences || {},
      });
    }

    return employees;
  }

  private getShiftColor(status: ShiftStatus): string {
    const colors: Record<ShiftStatus, string> = {
      [ShiftStatus.OPEN]: '#94a3b8', // gray
      [ShiftStatus.ASSIGNED]: '#3b82f6', // blue
      [ShiftStatus.CONFIRMED]: '#22c55e', // green
      [ShiftStatus.IN_PROGRESS]: '#eab308', // yellow
      [ShiftStatus.COMPLETED]: '#6b7280', // dark gray
      [ShiftStatus.CANCELLED]: '#ef4444', // red
    };
    return colors[status] || '#94a3b8';
  }
}

