// backend/src/modules/availability/availability.service.ts
// Service implementing availability management business logic

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Availability, AvailabilityType } from './entities/availability.entity';
import { User } from '../users/entities/user.entity';
import { Team } from '../users/entities/team.entity';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  AvailabilityResponseDto,
  BulkAvailabilityDto,
} from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createDto: CreateAvailabilityDto): Promise<AvailabilityResponseDto> {
    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${createDto.userId} not found`);
    }

    // Validate time range
    const startTime = new Date(createDto.startTime);
    const endTime = new Date(createDto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping availability
    const overlapping = await this.findOverlapping(
      createDto.userId,
      startTime,
      endTime,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        `Availability overlaps with existing window (${overlapping[0].id})`,
      );
    }

    const availability = this.availabilityRepository.create({
      userId: createDto.userId,
      startTime,
      endTime,
      type: createDto.type,
      notes: createDto.notes,
      recurrence: createDto.recurrence,
    });

    const saved = await this.availabilityRepository.save(availability);
    this.logger.log(
      `Created availability ${saved.id} for user ${createDto.userId}`,
    );

    return this.toResponseDto(saved);
  }

  async createBulk(bulkDto: BulkAvailabilityDto): Promise<AvailabilityResponseDto[]> {
    const results: AvailabilityResponseDto[] = [];

    for (const window of bulkDto.windows) {
      const result = await this.create({
        ...window,
        userId: bulkDto.userId,
      });
      results.push(result);
    }

    return results;
  }

  async findByUser(
    userId: string,
    from: string,
    to: string,
  ): Promise<AvailabilityResponseDto[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const availabilities = await this.availabilityRepository.find({
      where: {
        userId,
        startTime: MoreThanOrEqual(fromDate),
        endTime: LessThanOrEqual(toDate),
      },
      order: { startTime: 'ASC' },
    });

    return availabilities.map((a) => this.toResponseDto(a));
  }

  async findByTeam(teamId: string, from: string, to: string) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const userIds = team.members.map((m) => m.id);
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const availabilities = await this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.user', 'user')
      .where('availability.userId IN (:...userIds)', { userIds })
      .andWhere('availability.startTime >= :from', { from: fromDate })
      .andWhere('availability.endTime <= :to', { to: toDate })
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('availability.startTime', 'ASC')
      .getMany();

    // Group by user
    const byUser: Record<
      string,
      {
        user: { id: string; name: string };
        windows: AvailabilityResponseDto[];
      }
    > = {};

    for (const a of availabilities) {
      if (!byUser[a.userId]) {
        byUser[a.userId] = {
          user: {
            id: a.user.id,
            name: `${a.user.firstName} ${a.user.lastName}`,
          },
          windows: [],
        };
      }
      byUser[a.userId].windows.push(this.toResponseDto(a));
    }

    return Object.values(byUser);
  }

  async findOne(id: string): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException(`Availability ${id} not found`);
    }

    return this.toResponseDto(availability);
  }

  async update(
    id: string,
    updateDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException(`Availability ${id} not found`);
    }

    // Validate time range if updating
    if (updateDto.startTime || updateDto.endTime) {
      const startTime = updateDto.startTime
        ? new Date(updateDto.startTime)
        : availability.startTime;
      const endTime = updateDto.endTime
        ? new Date(updateDto.endTime)
        : availability.endTime;

      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check for overlapping (excluding self)
      const overlapping = await this.findOverlapping(
        availability.userId,
        startTime,
        endTime,
        id,
      );

      if (overlapping.length > 0) {
        throw new BadRequestException(
          `Availability overlaps with existing window (${overlapping[0].id})`,
        );
      }

      availability.startTime = startTime;
      availability.endTime = endTime;
    }

    if (updateDto.type !== undefined) {
      availability.type = updateDto.type;
    }
    if (updateDto.notes !== undefined) {
      availability.notes = updateDto.notes;
    }
    if (updateDto.recurrence !== undefined) {
      availability.recurrence = updateDto.recurrence;
    }

    const saved = await this.availabilityRepository.save(availability);
    this.logger.log(`Updated availability ${id}`);

    return this.toResponseDto(saved);
  }

  async remove(id: string): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException(`Availability ${id} not found`);
    }

    await this.availabilityRepository.remove(availability);
    this.logger.log(`Deleted availability ${id}`);
  }

  async removeByUser(userId: string, from: string, to: string): Promise<void> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const result = await this.availabilityRepository.delete({
      userId,
      startTime: MoreThanOrEqual(fromDate),
      endTime: LessThanOrEqual(toDate),
    });

    this.logger.log(
      `Deleted ${result.affected} availability windows for user ${userId}`,
    );
  }

  // Check if a shift time is within available (non-blackout) windows
  isAvailableForShift(
    availabilities: Availability[],
    shiftStart: Date,
    shiftEnd: Date,
  ): { available: boolean; type: AvailabilityType | null } {
    for (const a of availabilities) {
      if (a.contains(shiftStart, shiftEnd)) {
        if (a.type === AvailabilityType.BLACKOUT) {
          return { available: false, type: AvailabilityType.BLACKOUT };
        }
        return { available: true, type: a.type };
      }
    }
    // No availability window covers the shift
    return { available: false, type: null };
  }

  private async findOverlapping(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Availability[]> {
    const query = this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.userId = :userId', { userId })
      .andWhere('availability.startTime < :endTime', { endTime })
      .andWhere('availability.endTime > :startTime', { startTime });

    if (excludeId) {
      query.andWhere('availability.id != :excludeId', { excludeId });
    }

    return query.getMany();
  }

  private toResponseDto(availability: Availability): AvailabilityResponseDto {
    return {
      id: availability.id,
      userId: availability.userId,
      startTime: availability.startTime.toISOString(),
      endTime: availability.endTime.toISOString(),
      type: availability.type,
      notes: availability.notes,
      recurrence: availability.recurrence,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    };
  }
}

