// backend/src/common/guards/team.guard.ts
// Guard for verifying team membership and resource ownership

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../modules/users/entities/team.entity';
import { UserRole } from '../../modules/users/entities/user.entity';

@Injectable()
export class TeamGuard implements CanActivate {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId || request.body.teamId;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins can access any team
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (!teamId) {
      // No team context - allow if accessing own resources
      return true;
    }

    // Verify team exists
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    // Check if user is a member of the team
    const isMember = team.members.some((member) => member.id === user.id);

    // Managers can access teams they manage
    if (user.role === UserRole.MANAGER) {
      const isTeamManager = team.members.some(
        (member) => member.managerId === user.id,
      );
      if (isMember || isTeamManager) {
        return true;
      }
    }

    // Regular employees can only access their own team
    if (user.teamId === teamId) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied: You do not have access to this team',
    );
  }
}

