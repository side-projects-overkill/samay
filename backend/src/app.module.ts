// backend/src/app.module.ts
// Root module assembling all domain modules in the modular monolith

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementModule } from './modules/users/user-management.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { RosterModule } from './modules/roster/roster.module';
import { SolverModule } from './modules/solver/solver.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Domain modules (modular monolith boundaries)
    UserManagementModule,
    AvailabilityModule,
    RosterModule,
    SolverModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

