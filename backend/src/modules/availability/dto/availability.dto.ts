// backend/src/modules/availability/dto/availability.dto.ts
// DTOs for availability management

import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AvailabilityType } from '../entities/availability.entity';

export class RecurrenceDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  @IsString()
  pattern: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5], description: 'Days of week (0-6)' })
  @IsOptional()
  @IsArray()
  daysOfWeek?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateAvailabilityDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '2025-12-01T09:00:00+05:30' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-12-01T17:00:00+05:30' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ enum: AvailabilityType })
  @IsEnum(AvailabilityType)
  type: AvailabilityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: RecurrenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;
}

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {}

export class AvailabilityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: AvailabilityType })
  type: AvailabilityType;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiPropertyOptional()
  recurrence: RecurrenceDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BulkAvailabilityDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ type: [CreateAvailabilityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAvailabilityDto)
  windows: Omit<CreateAvailabilityDto, 'userId'>[];
}

// For solver payload serialization
export class SerializedAvailabilityDto {
  @ApiProperty()
  start: string;

  @ApiProperty()
  end: string;

  @ApiProperty({ enum: AvailabilityType })
  type: AvailabilityType;
}

