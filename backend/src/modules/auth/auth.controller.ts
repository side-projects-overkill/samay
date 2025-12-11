// backend/src/modules/auth/auth.controller.ts
// Authentication controller for login/logout operations

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { User, UserRole } from '../users/entities/user.entity';
import { Team } from '../users/entities/team.entity';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}

class LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    teamId?: string;
    teamName?: string;
    managerId?: string;
    managerName?: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@samay.io' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
      relations: ['team', 'manager'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password - demo mode accepts role-specific or universal demo password
    const validPasswords: Record<string, string> = {
      admin: 'admin123',
      manager: 'manager123',
      employee: 'associate123',
    };

    const expectedPassword = validPasswords[user.role] || 'associate123';
    const universalDemoPassword = 'demo123';
    
    // Accept either the role-specific password OR the universal demo password
    if (password !== expectedPassword && password !== universalDemoPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Map backend role to frontend role
    const roleMap: Record<string, string> = {
      admin: 'SUPERADMIN',
      manager: 'MANAGER',
      employee: 'ASSOCIATE',
    };

    // Generate a simple JWT token (in production, use proper JWT)
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    ).toString('base64');

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleMap[user.role] || 'ASSOCIATE',
        teamId: user.teamId || undefined,
        teamName: user.team?.name || undefined,
        managerId: user.managerId || undefined,
        managerName: user.manager
          ? `${user.manager.firstName} ${user.manager.lastName}`
          : undefined,
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Create new user as employee (Associate) - they go to unassigned pool
    const newUser = this.userRepository.create({
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: UserRole.EMPLOYEE, // All new users start as Associate
      isActive: true,
      // No team assigned - goes to unassigned pool
    });

    await this.userRepository.save(newUser);

    // Generate token
    const token = Buffer.from(
      JSON.stringify({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }),
    ).toString('base64');

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: 'ASSOCIATE',
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(): Promise<{ message: string }> {
    // In a real implementation, invalidate the token
    return { message: 'Logged out successfully' };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate token and get current user' })
  async validate(@Body() body: { token: string }): Promise<LoginResponseDto['user'] | null> {
    try {
      const decoded = JSON.parse(Buffer.from(body.token, 'base64').toString());
      
      if (decoded.exp < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, isActive: true },
        relations: ['team', 'manager'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const roleMap: Record<string, string> = {
        admin: 'SUPERADMIN',
        manager: 'MANAGER',
        employee: 'ASSOCIATE',
      };

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleMap[user.role] || 'ASSOCIATE',
        teamId: user.teamId || undefined,
        teamName: user.team?.name || undefined,
        managerId: user.managerId || undefined,
        managerName: user.manager
          ? `${user.manager.firstName} ${user.manager.lastName}`
          : undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
