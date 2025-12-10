// backend/src/modules/users/users.service.ts
// Service implementing user management business logic

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Skill } from './entities/skill.entity';
import { Availability } from '../availability/entities/availability.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserFilterDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check for existing email
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    // Validate manager if provided
    if (createUserDto.managerId) {
      const manager = await this.userRepository.findOne({
        where: { id: createUserDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException(
          `Manager with id ${createUserDto.managerId} not found`,
        );
      }
      if (manager.role === UserRole.EMPLOYEE) {
        throw new ConflictException('Employees cannot be managers');
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      role: createUserDto.role || UserRole.EMPLOYEE,
    });

    const saved = await this.userRepository.save(user);
    this.logger.log(`Created user ${saved.id} (${saved.email})`);

    return this.toResponseDto(saved);
  }

  async findAll(filters: UserFilterDto): Promise<UserResponseDto[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skills')
      .leftJoinAndSelect('user.team', 'team');

    if (filters.teamId) {
      query.andWhere('user.teamId = :teamId', { teamId: filters.teamId });
    }

    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    const users = await query.getMany();
    return users.map((user) => this.toResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['skills', 'team', 'manager'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['skills'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Check email uniqueness if changing
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    // Validate manager if changing
    if (updateUserDto.managerId && updateUserDto.managerId !== user.managerId) {
      if (updateUserDto.managerId === id) {
        throw new ConflictException('User cannot be their own manager');
      }
      const manager = await this.userRepository.findOne({
        where: { id: updateUserDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException(
          `Manager with id ${updateUserDto.managerId} not found`,
        );
      }
    }

    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);

    this.logger.log(`Updated user ${saved.id}`);
    return this.toResponseDto(saved);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Soft delete by marking inactive
    user.isActive = false;
    await this.userRepository.save(user);

    this.logger.log(`Soft deleted user ${id}`);
  }

  async updateSkills(id: string, skillIds: string[]): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['skills'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const skills = await this.skillRepository.find({
      where: { id: In(skillIds) },
    });

    if (skills.length !== skillIds.length) {
      const foundIds = skills.map((s) => s.id);
      const missingIds = skillIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Skills not found: ${missingIds.join(', ')}`);
    }

    user.skills = skills;
    const saved = await this.userRepository.save(user);

    this.logger.log(`Updated skills for user ${id}: ${skillIds.join(', ')}`);
    return this.toResponseDto(saved);
  }

  async getAvailability(userId: string, from: string, to: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const availabilities = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.userId = :userId', { userId })
      .andWhere('availability.startTime >= :from', { from: fromDate })
      .andWhere('availability.endTime <= :to', { to: toDate })
      .orderBy('availability.startTime', 'ASC')
      .getMany();

    return availabilities.map((a) => ({
      id: a.id,
      start: a.startTime.toISOString(),
      end: a.endTime.toISOString(),
      type: a.type,
      notes: a.notes,
    }));
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      managerId: user.managerId,
      teamId: user.teamId,
      shiftPreferences: user.shiftPreferences,
      skills: user.skills?.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

