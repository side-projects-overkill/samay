// backend/src/modules/solver/solver.module.ts
// Module for solver client and real-time events

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolverClient } from './solver.client';
import { RosterGateway } from './roster.gateway';

@Module({
  imports: [ConfigModule],
  providers: [SolverClient, RosterGateway],
  exports: [SolverClient, RosterGateway],
})
export class SolverModule {}

