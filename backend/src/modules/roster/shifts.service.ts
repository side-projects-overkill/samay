// backend/src/modules/roster/shifts.service.ts
// Service implementing shift management with optimistic locking

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  MoreThanOrEqual,
  LessThanOrEqual,
  OptimisticLockVersionMismatchError,
} from 'typeorm';
import { Shift, ShiftStatus } from './entities/shift.entity';
import { User } from '../users/entities/user.entity';
import { Team } from '../users/entities/team.entity';
import { Availability, AvailabilityType } from '../availability/entities/availability.entity';
import {
  CreateShiftDto,
  UpdateShiftDto,
  ShiftResponseDto,
  ShiftFilterDto,
} from './dto/shift.dto';

@Injectable()
export class ShiftsService {
  private readonly logger = new Logger(ShiftsService.name);

  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateShiftDto): Promise<ShiftResponseDto> {
    // Validate team exists
    const team = await this.teamRepository.findOne({
      where: { id: createDto.teamId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${createDto.teamId} not found`);
    }

    // Build full datetime
    const startDateTime = new Date(`${createDto.date}T${createDto.startTime}:00`);
    const endDateTime = new Date(`${createDto.date}T${createDto.endTime}:00`);

    // Handle shifts that cross midnight
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const shift = this.shiftRepository.create({
      teamId: createDto.teamId,
      date: createDto.date,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      startDateTime,
      endDateTime,
      shiftCode: createDto.shiftCode,
      durationHours: createDto.durationHours,
      requiredSkills: createDto.requiredSkills || [],
      notes: createDto.notes,
      status: ShiftStatus.OPEN,
    });

    const saved = await this.shiftRepository.save(shift);
    this.logger.log(`Created shift ${saved.id} for team ${createDto.teamId}`);

    return this.toResponseDto(saved);
  }

  async createBulk(shifts: CreateShiftDto[]): Promise<ShiftResponseDto[]> {
    const results: ShiftResponseDto[] = [];
    for (const dto of shifts) {
      results.push(await this.create(dto));
    }
    return results;
  }

  async findAll(filters: ShiftFilterDto): Promise<ShiftResponseDto[]> {
    const query = this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.assignedUser', 'assignedUser')
      .leftJoinAndSelect('shift.team', 'team');

    if (filters.teamId) {
      query.andWhere('shift.teamId = :teamId', { teamId: filters.teamId });
    }

    if (filters.from) {
      query.andWhere('shift.date >= :from', { from: filters.from });
    }

    if (filters.to) {
      query.andWhere('shift.date <= :to', { to: filters.to });
    }

    if (filters.status) {
      query.andWhere('shift.status = :status', { status: filters.status });
    }

    if (filters.userId) {
      query.andWhere('shift.assignedUserId = :userId', { userId: filters.userId });
    }

    query.orderBy('shift.date', 'ASC').addOrderBy('shift.startTime', 'ASC');

    const shifts = await query.getMany();
    return shifts.map((s) => this.toResponseDto(s));
  }

  async findOne(id: string): Promise<ShiftResponseDto> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'team'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift ${id} not found`);
    }

    return this.toResponseDto(shift);
  }

  async update(id: string, updateDto: UpdateShiftDto): Promise<ShiftResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shift = await queryRunner.manager.findOne(Shift, {
        where: { id },
        relations: ['assignedUser'],
      });

      if (!shift) {
        throw new NotFoundException(`Shift ${id} not found`);
      }

      // Optimistic locking check
      if (
        updateDto.expectedVersion !== undefined &&
        shift.version !== updateDto.expectedVersion
      ) {
        throw new ConflictException(
          `Shift has been modified. Expected version ${updateDto.expectedVersion}, got ${shift.version}`,
        );
      }

      // Update fields
      if (updateDto.date) shift.date = updateDto.date;
      if (updateDto.startTime) shift.startTime = updateDto.startTime;
      if (updateDto.endTime) shift.endTime = updateDto.endTime;
      if (updateDto.shiftCode) shift.shiftCode = updateDto.shiftCode;
      if (updateDto.durationHours) shift.durationHours = updateDto.durationHours;
      if (updateDto.requiredSkills) shift.requiredSkills = updateDto.requiredSkills;
      if (updateDto.status) shift.status = updateDto.status;
      if (updateDto.notes !== undefined) shift.notes = updateDto.notes;

      // Rebuild datetime if date/time changed
      if (updateDto.date || updateDto.startTime || updateDto.endTime) {
        shift.startDateTime = new Date(
          `${shift.date}T${shift.startTime}:00`,
        );
        shift.endDateTime = new Date(`${shift.date}T${shift.endTime}:00`);
        if (shift.endDateTime <= shift.startDateTime) {
          shift.endDateTime.setDate(shift.endDateTime.getDate() + 1);
        }
      }

      const saved = await queryRunner.manager.save(shift);
      await queryRunner.commitTransaction();

      this.logger.log(`Updated shift ${id} to version ${saved.version}`);
      return this.toResponseDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException(
          'Shift was modified by another user. Please refresh and try again.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const shift = await this.shiftRepository.findOne({ where: { id } });

    if (!shift) {
      throw new NotFoundException(`Shift ${id} not found`);
    }

    if (shift.status === ShiftStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete an in-progress shift');
    }

    await this.shiftRepository.remove(shift);
    this.logger.log(`Deleted shift ${id}`);
  }

  async assign(
    shiftId: string,
    userId: string,
    source: 'manual' | 'solver' | 'swap',
  ): Promise<ShiftResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shift = await queryRunner.manager.findOne(Shift, {
        where: { id: shiftId },
      });

      if (!shift) {
        throw new NotFoundException(`Shift ${shiftId} not found`);
      }

      if (
        shift.status !== ShiftStatus.OPEN &&
        shift.status !== ShiftStatus.ASSIGNED
      ) {
        throw new BadRequestException(
          `Cannot assign shift with status ${shift.status}`,
        );
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['skills'],
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Validate skills
      if (shift.requiredSkills.length > 0) {
        const userSkillCodes = user.skills.map((s) => s.code);
        const missingSkills = shift.requiredSkills.filter(
          (s) => !userSkillCodes.includes(s),
        );
        if (missingSkills.length > 0) {
          throw new BadRequestException(
            `User lacks required skills: ${missingSkills.join(', ')}`,
          );
        }
      }

      // Check availability
      const availability = await this.availabilityRepository
        .createQueryBuilder('a')
        .where('a.userId = :userId', { userId })
        .andWhere('a.startTime <= :start', { start: shift.startDateTime })
        .andWhere('a.endTime >= :end', { end: shift.endDateTime })
        .getOne();

      if (availability?.type === AvailabilityType.BLACKOUT) {
        throw new BadRequestException(
          'User has blackout during this shift time',
        );
      }

      // Check for double booking
      const conflictingShift = await queryRunner.manager
        .createQueryBuilder(Shift, 's')
        .where('s.assignedUserId = :userId', { userId })
        .andWhere('s.id != :shiftId', { shiftId })
        .andWhere('s.startDateTime < :end', { end: shift.endDateTime })
        .andWhere('s.endDateTime > :start', { start: shift.startDateTime })
        .andWhere('s.status NOT IN (:...statuses)', {
          statuses: [ShiftStatus.CANCELLED],
        })
        .getOne();

      if (conflictingShift) {
        throw new ConflictException(
          `User already assigned to shift ${conflictingShift.id} during this time`,
        );
      }

      // Store previous assignment for swap history
      const previousUserId = shift.assignedUserId;

      shift.assignedUserId = userId;
      shift.assignedAt = new Date();
      shift.assignmentSource = source;
      shift.status = ShiftStatus.ASSIGNED;

      if (previousUserId && source === 'swap') {
        const metadata = shift.metadata as Record<string, unknown>;
        const history = (metadata.swapHistory as Array<{ from: string; to: string; at: string }>) || [];
        history.push({
          from: previousUserId,
          to: userId,
          at: new Date().toISOString(),
        });
        shift.metadata = { ...metadata, swapHistory: history };
      }

      const saved = await queryRunner.manager.save(shift);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Assigned shift ${shiftId} to user ${userId} via ${source}`,
      );
      return this.toResponseDto(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unassign(shiftId: string): Promise<ShiftResponseDto> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException(`Shift ${shiftId} not found`);
    }

    if (shift.status === ShiftStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot unassign an in-progress shift');
    }

    const previousUserId = shift.assignedUserId;

    shift.assignedUserId = null;
    shift.assignedAt = null;
    shift.assignmentSource = null;
    shift.status = ShiftStatus.OPEN;

    if (previousUserId) {
      shift.metadata = {
        ...shift.metadata,
        originalAssignee: previousUserId,
      };
    }

    const saved = await this.shiftRepository.save(shift);
    this.logger.log(`Unassigned shift ${shiftId}`);

    return this.toResponseDto(saved);
  }

  async findOpenShiftsForTeam(
    teamId: string,
    from: string,
    to: string,
  ): Promise<Shift[]> {
    return this.shiftRepository.find({
      where: {
        teamId,
        status: ShiftStatus.OPEN,
        date: MoreThanOrEqual(from) && LessThanOrEqual(to) ? undefined : undefined,
      },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  private toResponseDto(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      version: shift.version,
      teamId: shift.teamId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      startDateTime: shift.startDateTime.toISOString(),
      endDateTime: shift.endDateTime.toISOString(),
      shiftCode: shift.shiftCode,
      durationHours: Number(shift.durationHours),
      status: shift.status,
      requiredSkills: shift.requiredSkills,
      assignedUserId: shift.assignedUserId,
      assignedUser: shift.assignedUser
        ? {
            id: shift.assignedUser.id,
            firstName: shift.assignedUser.firstName,
            lastName: shift.assignedUser.lastName,
            email: shift.assignedUser.email,
          }
        : undefined,
      assignedAt: shift.assignedAt?.toISOString() || null,
      assignmentSource: shift.assignmentSource,
      notes: shift.notes,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    };
  }
}

