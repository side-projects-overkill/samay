// backend/src/modules/users/teams.service.ts
// Service implementing team management business logic

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from './entities/user.entity';
import { CreateTeamDto, UpdateTeamDto, TeamResponseDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamResponseDto> {
    // Check for existing team name
    const existing = await this.teamRepository.findOne({
      where: { name: createTeamDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Team with name "${createTeamDto.name}" already exists`,
      );
    }

    const team = this.teamRepository.create(createTeamDto);
    const saved = await this.teamRepository.save(team);

    this.logger.log(`Created team ${saved.id} (${saved.name})`);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.find({
      relations: ['members'],
      order: { name: 'ASC' },
    });

    return teams.map((team) => this.toResponseDto(team));
  }

  async findOne(id: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'members.skills'],
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    return this.toResponseDto(team);
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    // Check name uniqueness if changing
    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existing = await this.teamRepository.findOne({
        where: { name: updateTeamDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Team with name "${updateTeamDto.name}" already exists`,
        );
      }
    }

    Object.assign(team, updateTeamDto);
    const saved = await this.teamRepository.save(team);

    this.logger.log(`Updated team ${saved.id}`);
    return this.toResponseDto(saved);
  }

  async remove(id: string): Promise<void> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    if (team.members && team.members.length > 0) {
      throw new ConflictException(
        `Cannot delete team with ${team.members.length} members. Remove members first.`,
      );
    }

    await this.teamRepository.remove(team);
    this.logger.log(`Deleted team ${id}`);
  }

  async addMember(teamId: string, userId: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.teamId && user.teamId !== teamId) {
      throw new ConflictException(
        `User ${userId} is already a member of another team`,
      );
    }

    user.teamId = teamId;
    await this.userRepository.save(user);

    this.logger.log(`Added user ${userId} to team ${teamId}`);

    // Refresh team with updated members
    return this.findOne(teamId);
  }

  async removeMember(teamId: string, userId: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.teamId !== teamId) {
      throw new ConflictException(`User ${userId} is not a member of team ${teamId}`);
    }

    user.teamId = null;
    await this.userRepository.save(user);

    this.logger.log(`Removed user ${userId} from team ${teamId}`);

    return this.findOne(teamId);
  }

  private toResponseDto(team: Team): TeamResponseDto {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      isActive: team.isActive,
      settings: team.settings || {},
      members: team.members?.map((m) => ({
        id: m.id,
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        role: m.role,
      })),
      memberCount: team.members?.length || 0,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}

