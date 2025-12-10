// backend/src/modules/roster/roster.module.ts
// Domain module for roster and shift management

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { ShiftsService } from './shifts.service';
import { UserManagementModule } from '../users/user-management.module';
import { AvailabilityModule } from '../availability/availability.module';
import { SolverModule } from '../solver/solver.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift]),
    UserManagementModule,
    AvailabilityModule,
    SolverModule,
  ],
  controllers: [RosterController],
  providers: [RosterService, ShiftsService],
  exports: [RosterService, ShiftsService, TypeOrmModule],
})
export class RosterModule {}

