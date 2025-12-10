// backend/src/modules/users/user-management.module.ts
// Domain module for user and team management

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Team } from './entities/team.entity';
import { Skill } from './entities/skill.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { SkillsService } from './skills.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team, Skill])],
  controllers: [UsersController, TeamsController],
  providers: [UsersService, TeamsService, SkillsService],
  exports: [UsersService, TeamsService, SkillsService, TypeOrmModule],
})
export class UserManagementModule {}

