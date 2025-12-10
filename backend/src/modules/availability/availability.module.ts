// backend/src/modules/availability/availability.module.ts
// Domain module for employee availability management

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { UserManagementModule } from '../users/user-management.module';

@Module({
  imports: [TypeOrmModule.forFeature([Availability]), UserManagementModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService, TypeOrmModule],
})
export class AvailabilityModule {}

