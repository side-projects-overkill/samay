// backend/src/modules/auth/auth.module.ts
// Authentication module

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Team } from '../users/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  controllers: [AuthController],
})
export class AuthModule {}

