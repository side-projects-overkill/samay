// backend/src/modules/users/dto/team.dto.ts
// DTOs for team management operations

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class TeamSettingsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxShiftsPerDay?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRestHours?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  defaultShiftDuration?: number;
}

export class CreateTeamDto {
  @ApiProperty({ example: 'Warehouse Team A' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Main warehouse morning shift team' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: TeamSettingsDto })
  @IsOptional()
  @IsObject()
  settings?: TeamSettingsDto;
}

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TeamMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;
}

export class TeamResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: TeamSettingsDto })
  settings: TeamSettingsDto;

  @ApiProperty({ type: [TeamMemberDto] })
  members?: TeamMemberDto[];

  @ApiProperty()
  memberCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

