// backend/src/modules/availability/availability.controller.ts
// REST controller for availability management

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  AvailabilityResponseDto,
  BulkAvailabilityDto,
} from './dto/availability.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('availability')
@Controller('availability')
@UseGuards(RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability window' })
  @ApiResponse({ status: 201, type: AvailabilityResponseDto })
  async create(
    @Body() createDto: CreateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.create(createDto);
  }

  @Post('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple availability windows' })
  @ApiResponse({ status: 201, type: [AvailabilityResponseDto] })
  async createBulk(
    @Body() bulkDto: BulkAvailabilityDto,
  ): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.createBulk(bulkDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get availability for a user' })
  @ApiQuery({ name: 'from', required: true, description: 'Start date (ISO)' })
  @ApiQuery({ name: 'to', required: true, description: 'End date (ISO)' })
  @ApiResponse({ status: 200, type: [AvailabilityResponseDto] })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<AvailabilityResponseDto[]> {
    return this.availabilityService.findByUser(userId, from, to);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get availability for all team members' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiResponse({ status: 200 })
  async findByTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availabilityService.findByTeam(teamId, from, to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability by ID' })
  @ApiResponse({ status: 200, type: AvailabilityResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability' })
  @ApiResponse({ status: 200, type: AvailabilityResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    return this.availabilityService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete availability' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.availabilityService.remove(id);
  }

  @Delete('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all availability for a user in date range' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async removeByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<void> {
    await this.availabilityService.removeByUser(userId, from, to);
  }
}

