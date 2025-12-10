// backend/src/common/dto/optimize.dto.ts
// DTOs for the optimization API - shared validation schemas

import {
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AvailabilityTypeDto {
  PREFERRED = 'PREFERRED',
  NEUTRAL = 'NEUTRAL',
  AVOIDED = 'AVOIDED',
  BLACKOUT = 'BLACKOUT',
}

export class AvailabilityWindowDto {
  @ApiProperty({ example: '2025-12-01T09:00:00+05:30' })
  @IsString()
  start: string;

  @ApiProperty({ example: '2025-12-01T13:00:00+05:30' })
  @IsString()
  end: string;

  @ApiProperty({ enum: AvailabilityTypeDto })
  @IsEnum(AvailabilityTypeDto)
  type: AvailabilityTypeDto;
}

export class EmployeeDto {
  @ApiProperty({ example: 'e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: ['skill_forklift', 'skill_cashier'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ type: [AvailabilityWindowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  availability: AvailabilityWindowDto[];

  @ApiProperty({ example: { shift_morning: 10, shift_evening: -5 } })
  @IsObject()
  preferences: Record<string, number>;
}

export class OpenShiftDto {
  @ApiProperty({ example: 'shift-001' })
  @IsString()
  id: string;

  @ApiProperty({ example: '2025-12-01' })
  @IsDateString()
  day: string;

  @ApiProperty({ example: 'shift_morning' })
  @IsString()
  shiftCode: string;

  @ApiProperty({ example: ['skill_cashier'] })
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(0.5)
  @Max(24)
  durationHours: number;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class OptimizeWeightsDto {
  @ApiProperty({ example: 10, description: 'Weight for preferred availability' })
  @IsNumber()
  preferred: number;

  @ApiProperty({ example: 0, description: 'Weight for neutral availability' })
  @IsNumber()
  neutral: number;

  @ApiProperty({ example: -10, description: 'Weight for avoided availability' })
  @IsNumber()
  avoided: number;
}

export class OptimizeSettingsDto {
  @ApiProperty({ example: 100, description: 'Penalty for unassigned shifts' })
  @IsNumber()
  @Min(0)
  unassignedPenalty: number;

  @ApiProperty({ type: OptimizeWeightsDto })
  @ValidateNested()
  @Type(() => OptimizeWeightsDto)
  weights: OptimizeWeightsDto;

  @ApiPropertyOptional({ example: 1, description: 'Max shifts per employee per day' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  maxShiftsPerDay?: number;

  @ApiPropertyOptional({ example: 30, description: 'Solver timeout in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  timeoutSeconds?: number;
}

export class OptimizeRequestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  teamId: string;

  @ApiProperty({ example: '2025-12-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2025-12-07' })
  @IsDateString()
  dateTo: string;

  @ApiProperty({ type: [EmployeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDto)
  employees: EmployeeDto[];

  @ApiProperty({ type: [OpenShiftDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpenShiftDto)
  openShifts: OpenShiftDto[];

  @ApiProperty({ type: OptimizeSettingsDto })
  @ValidateNested()
  @Type(() => OptimizeSettingsDto)
  settings: OptimizeSettingsDto;
}

// Response DTOs
export class AssignmentDto {
  @ApiProperty()
  shiftId: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  start: string;

  @ApiProperty()
  end: string;

  @ApiPropertyOptional()
  notes?: string;
}

export class DiagnosticsDto {
  @ApiProperty()
  relaxed: boolean;

  @ApiPropertyOptional()
  unsatCore: string[] | null;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  minimalUnsat?: string[];

  @ApiPropertyOptional()
  solveTimeMs?: number;

  @ApiPropertyOptional()
  totalShifts?: number;

  @ApiPropertyOptional()
  assignedShifts?: number;

  @ApiPropertyOptional()
  unfilledShifts?: number;
}

export class SuggestionDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  impact?: string;
}

export enum OptimizeStatus {
  OPTIMAL = 'OPTIMAL',
  FEASIBLE = 'FEASIBLE',
  INFEASIBLE = 'INFEASIBLE',
  OPTIMAL_RELAXED = 'OPTIMAL_RELAXED',
  TIMEOUT = 'TIMEOUT',
  ERROR = 'ERROR',
}

export class OptimizeResponseDto {
  @ApiProperty({ enum: OptimizeStatus })
  status: OptimizeStatus;

  @ApiProperty({ type: [AssignmentDto] })
  assignments: AssignmentDto[];

  @ApiPropertyOptional()
  fitness: number | null;

  @ApiProperty({ type: DiagnosticsDto })
  diagnostics: DiagnosticsDto;

  @ApiPropertyOptional({ type: [SuggestionDto] })
  suggestions?: SuggestionDto[];

  @ApiPropertyOptional({ description: 'Relaxed solution if main is infeasible' })
  relaxedSolution?: {
    status: string;
    assignments: AssignmentDto[];
    fitness: number;
    relaxedConstraints: string[];
  };
}

