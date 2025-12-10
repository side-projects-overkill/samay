// backend/src/modules/roster/dto/shift.dto.ts
// DTOs for shift management operations

import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ShiftStatus } from '../entities/shift.entity';

export class CreateShiftDto {
  @ApiProperty()
  @IsUUID()
  teamId: string;

  @ApiProperty({ example: '2025-12-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:MM format' })
  endTime: string;

  @ApiProperty({ example: 'shift_morning' })
  @IsString()
  shiftCode: string;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  durationHours: number;

  @ApiPropertyOptional({ example: ['skill_cashier'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @ApiPropertyOptional({ enum: ShiftStatus })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiPropertyOptional({ description: 'Expected version for optimistic locking' })
  @IsOptional()
  @IsNumber()
  expectedVersion?: number;
}

export class AssignShiftDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Expected version for optimistic locking' })
  @IsOptional()
  @IsNumber()
  expectedVersion?: number;
}

export class ShiftResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  teamId: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  startDateTime: string;

  @ApiProperty()
  endDateTime: string;

  @ApiProperty()
  shiftCode: string;

  @ApiProperty()
  durationHours: number;

  @ApiProperty({ enum: ShiftStatus })
  status: ShiftStatus;

  @ApiProperty()
  requiredSkills: string[];

  @ApiPropertyOptional()
  assignedUserId: string | null;

  @ApiPropertyOptional()
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiPropertyOptional()
  assignedAt: string | null;

  @ApiPropertyOptional()
  assignmentSource: string | null;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ShiftFilterDto {
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

