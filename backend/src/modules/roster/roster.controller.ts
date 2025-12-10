// backend/src/modules/roster/roster.controller.ts
// REST controller for roster management with optimization trigger

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
import { RosterService } from './roster.service';
import { ShiftsService } from './shifts.service';
import {
  CreateShiftDto,
  UpdateShiftDto,
  ShiftResponseDto,
  AssignShiftDto,
} from './dto/shift.dto';
import {
  OptimizeRequestDto,
  OptimizeResponseDto,
} from '../../common/dto/optimize.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('roster')
@Controller('roster')
@UseGuards(RolesGuard)
export class RosterController {
  constructor(
    private readonly rosterService: RosterService,
    private readonly shiftsService: ShiftsService,
  ) {}

  // ==================== Optimization ====================

  @Post('optimize')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Trigger roster optimization',
    description:
      'Serializes current state and calls the solver to generate optimal shift assignments',
  })
  @ApiResponse({ status: 200, type: OptimizeResponseDto })
  async triggerOptimization(
    @Body() optimizeRequest: OptimizeRequestDto,
  ): Promise<OptimizeResponseDto> {
    return this.rosterService.triggerOptimization(optimizeRequest);
  }

  @Post('optimize/auto')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Auto-generate optimization payload and optimize',
    description:
      'Builds optimization request from database state and triggers solver',
  })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiResponse({ status: 200, type: OptimizeResponseDto })
  async autoOptimize(
    @Query('teamId', ParseUUIDPipe) teamId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<OptimizeResponseDto> {
    return this.rosterService.autoOptimize(teamId, from, to);
  }

  @Post('optimize/apply')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply optimization results to shifts',
    description: 'Persists solver assignments to the database',
  })
  async applyOptimization(
    @Body() optimizeResponse: OptimizeResponseDto,
  ): Promise<{ applied: number; failed: number }> {
    return this.rosterService.applyOptimization(optimizeResponse);
  }

  // ==================== Shifts ====================

  @Post('shifts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({ status: 201, type: ShiftResponseDto })
  async createShift(
    @Body() createShiftDto: CreateShiftDto,
  ): Promise<ShiftResponseDto> {
    return this.shiftsService.create(createShiftDto);
  }

  @Post('shifts/bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple shifts' })
  @ApiResponse({ status: 201, type: [ShiftResponseDto] })
  async createShiftsBulk(
    @Body() shifts: CreateShiftDto[],
  ): Promise<ShiftResponseDto[]> {
    return this.shiftsService.createBulk(shifts);
  }

  @Get('shifts')
  @ApiOperation({ summary: 'Get shifts with filters' })
  @ApiQuery({ name: 'teamId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, type: [ShiftResponseDto] })
  async findShifts(
    @Query('teamId') teamId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ): Promise<ShiftResponseDto[]> {
    return this.shiftsService.findAll({ teamId, from, to, status, userId });
  }

  @Get('shifts/:id')
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async findShift(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShiftResponseDto> {
    return this.shiftsService.findOne(id);
  }

  @Put('shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shift' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async updateShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<ShiftResponseDto> {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete('shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shift' })
  async deleteShift(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.shiftsService.remove(id);
  }

  @Post('shifts/:id/assign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign employee to shift' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async assignShift(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignShiftDto,
  ): Promise<ShiftResponseDto> {
    return this.shiftsService.assign(id, assignDto.userId, 'manual');
  }

  @Post('shifts/:id/unassign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unassign employee from shift' })
  @ApiResponse({ status: 200, type: ShiftResponseDto })
  async unassignShift(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShiftResponseDto> {
    return this.shiftsService.unassign(id);
  }

  // ==================== Calendar View ====================

  @Get('calendar/:teamId')
  @ApiOperation({ summary: 'Get calendar view for team' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  async getCalendar(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.rosterService.getCalendarView(teamId, from, to);
  }
}

