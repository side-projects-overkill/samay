// backend/src/modules/users/teams.controller.ts
// REST controller for team management operations

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, TeamResponseDto } from './dto/team.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from './entities/user.entity';

@ApiTags('teams')
@Controller('teams')
@UseGuards(RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, type: TeamResponseDto })
  async create(@Body() createTeamDto: CreateTeamDto): Promise<TeamResponseDto> {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, type: [TeamResponseDto] })
  async findAll(): Promise<TeamResponseDto[]> {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID with members' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeamResponseDto> {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team' })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.teamsService.remove(id);
  }

  @Post(':id/members/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add member to team' })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<TeamResponseDto> {
    return this.teamsService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove member from team' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<TeamResponseDto> {
    return this.teamsService.removeMember(id, userId);
  }
}

