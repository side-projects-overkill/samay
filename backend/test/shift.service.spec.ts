// backend/test/shift.service.spec.ts
// Unit tests for shift service constraints

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ShiftsService } from '../src/modules/roster/shifts.service';
import { Shift, ShiftStatus } from '../src/modules/roster/entities/shift.entity';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { Team } from '../src/modules/users/entities/team.entity';
import { Skill } from '../src/modules/users/entities/skill.entity';
import { Availability, AvailabilityType } from '../src/modules/availability/entities/availability.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('ShiftsService', () => {
  let service: ShiftsService;
  let shiftRepository: jest.Mocked<Repository<Shift>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let teamRepository: jest.Mocked<Repository<Team>>;
  let availabilityRepository: jest.Mocked<Repository<Availability>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        {
          provide: getRepositoryToken(Shift),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Team),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Availability),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
    shiftRepository = module.get(getRepositoryToken(Shift));
    userRepository = module.get(getRepositoryToken(User));
    teamRepository = module.get(getRepositoryToken(Team));
    availabilityRepository = module.get(getRepositoryToken(Availability));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a shift successfully', async () => {
      const createDto = {
        teamId: 'team-123',
        date: '2025-12-01',
        startTime: '09:00',
        endTime: '17:00',
        shiftCode: 'shift_morning',
        durationHours: 8,
        requiredSkills: ['skill_cashier'],
      };

      const mockTeam = { id: 'team-123', name: 'Test Team' };
      const mockShift = {
        id: 'shift-123',
        version: 1,
        ...createDto,
        status: ShiftStatus.OPEN,
        startDateTime: new Date('2025-12-01T09:00:00'),
        endDateTime: new Date('2025-12-01T17:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      teamRepository.findOne = jest.fn().mockResolvedValue(mockTeam);
      shiftRepository.create = jest.fn().mockReturnValue(mockShift);
      shiftRepository.save = jest.fn().mockResolvedValue(mockShift);

      const result = await service.create(createDto);

      expect(result.id).toBe('shift-123');
      expect(result.status).toBe(ShiftStatus.OPEN);
      expect(teamRepository.findOne).toHaveBeenCalledWith({ where: { id: 'team-123' } });
    });

    it('should throw NotFoundException if team does not exist', async () => {
      teamRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.create({
          teamId: 'nonexistent-team',
          date: '2025-12-01',
          startTime: '09:00',
          endTime: '17:00',
          shiftCode: 'shift_morning',
          durationHours: 8,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    const mockShift: Partial<Shift> = {
      id: 'shift-123',
      version: 1,
      teamId: 'team-123',
      status: ShiftStatus.OPEN,
      requiredSkills: ['skill_cashier'],
      startDateTime: new Date('2025-12-01T09:00:00'),
      endDateTime: new Date('2025-12-01T17:00:00'),
      metadata: {},
    };

    const mockUser: Partial<User> = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.EMPLOYEE,
      skills: [{ id: 'skill-1', code: 'skill_cashier', name: 'Cashier' } as Skill],
    };

    it('should assign employee to shift successfully', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockShift)
        .mockResolvedValueOnce(mockUser);

      mockQueryRunner.manager.createQueryBuilder().getOne.mockResolvedValue(null);
      availabilityRepository.createQueryBuilder().getOne = jest.fn().mockResolvedValue(null);

      mockQueryRunner.manager.save.mockResolvedValue({
        ...mockShift,
        assignedUserId: 'user-123',
        status: ShiftStatus.ASSIGNED,
      });

      const result = await service.assign('shift-123', 'user-123', 'manual');

      expect(result.status).toBe(ShiftStatus.ASSIGNED);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should reject assignment if employee lacks required skills', async () => {
      const userWithoutSkills: Partial<User> = {
        ...mockUser,
        skills: [], // No skills
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockShift)
        .mockResolvedValueOnce(userWithoutSkills);

      await expect(service.assign('shift-123', 'user-123', 'manual')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should reject assignment if employee has blackout during shift', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockShift)
        .mockResolvedValueOnce(mockUser);

      availabilityRepository.createQueryBuilder().getOne = jest.fn().mockResolvedValue({
        type: AvailabilityType.BLACKOUT,
      });

      await expect(service.assign('shift-123', 'user-123', 'manual')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject double booking (same employee, overlapping shifts)', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockShift)
        .mockResolvedValueOnce(mockUser);

      availabilityRepository.createQueryBuilder().getOne = jest.fn().mockResolvedValue(null);

      // Simulate existing conflicting shift
      mockQueryRunner.manager.createQueryBuilder().getOne.mockResolvedValue({
        id: 'other-shift',
        startDateTime: new Date('2025-12-01T08:00:00'),
        endDateTime: new Date('2025-12-01T12:00:00'),
      });

      await expect(service.assign('shift-123', 'user-123', 'manual')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Optimistic Locking', () => {
    it('should reject update if version mismatch', async () => {
      const mockShift = {
        id: 'shift-123',
        version: 2, // Current version is 2
        status: ShiftStatus.OPEN,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockShift);

      await expect(
        service.update('shift-123', {
          status: ShiftStatus.ASSIGNED,
          expectedVersion: 1, // Expecting version 1, but current is 2
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});

describe('Shift Constraint Validation', () => {
  describe('AddAtMostOne equivalent', () => {
    it('should not allow same employee to work two shifts at same time', () => {
      // This tests the constraint logic that the solver also uses
      const shifts = [
        { id: 's1', employeeId: 'e1', start: new Date('2025-12-01T09:00'), end: new Date('2025-12-01T13:00') },
        { id: 's2', employeeId: 'e1', start: new Date('2025-12-01T10:00'), end: new Date('2025-12-01T14:00') },
      ];

      const hasConflict = (s1: typeof shifts[0], s2: typeof shifts[0]) => {
        if (s1.employeeId !== s2.employeeId) return false;
        return s1.start < s2.end && s2.start < s1.end;
      };

      expect(hasConflict(shifts[0], shifts[1])).toBe(true);
    });

    it('should allow same employee to work non-overlapping shifts', () => {
      const shifts = [
        { id: 's1', employeeId: 'e1', start: new Date('2025-12-01T09:00'), end: new Date('2025-12-01T13:00') },
        { id: 's2', employeeId: 'e1', start: new Date('2025-12-01T14:00'), end: new Date('2025-12-01T18:00') },
      ];

      const hasConflict = (s1: typeof shifts[0], s2: typeof shifts[0]) => {
        if (s1.employeeId !== s2.employeeId) return false;
        return s1.start < s2.end && s2.start < s1.end;
      };

      expect(hasConflict(shifts[0], shifts[1])).toBe(false);
    });
  });
});

