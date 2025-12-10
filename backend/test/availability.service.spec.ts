// backend/test/availability.service.spec.ts
// Unit tests for availability parsing and validation

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityService } from '../src/modules/availability/availability.service';
import { Availability, AvailabilityType } from '../src/modules/availability/entities/availability.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { Team } from '../src/modules/users/entities/team.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let availabilityRepository: jest.Mocked<Repository<Availability>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let teamRepository: jest.Mocked<Repository<Team>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepository = module.get(getRepositoryToken(Availability));
    userRepository = module.get(getRepositoryToken(User));
    teamRepository = module.get(getRepositoryToken(Team));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create availability with valid data', async () => {
      const createDto = {
        userId: 'user-123',
        startTime: '2025-12-01T09:00:00Z',
        endTime: '2025-12-01T17:00:00Z',
        type: AvailabilityType.PREFERRED,
      };

      const mockUser = { id: 'user-123', firstName: 'John', lastName: 'Doe' };
      const mockAvailability = {
        id: 'avail-123',
        userId: 'user-123',
        startTime: new Date('2025-12-01T09:00:00Z'),
        endTime: new Date('2025-12-01T17:00:00Z'),
        type: AvailabilityType.PREFERRED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      availabilityRepository.createQueryBuilder().getMany = jest.fn().mockResolvedValue([]);
      availabilityRepository.create = jest.fn().mockReturnValue(mockAvailability);
      availabilityRepository.save = jest.fn().mockResolvedValue(mockAvailability);

      const result = await service.create(createDto);

      expect(result.id).toBe('avail-123');
      expect(result.type).toBe(AvailabilityType.PREFERRED);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.create({
          userId: 'nonexistent-user',
          startTime: '2025-12-01T09:00:00Z',
          endTime: '2025-12-01T17:00:00Z',
          type: AvailabilityType.PREFERRED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue({ id: 'user-123' });

      await expect(
        service.create({
          userId: 'user-123',
          startTime: '2025-12-01T17:00:00Z',
          endTime: '2025-12-01T09:00:00Z', // End before start
          type: AvailabilityType.PREFERRED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if availability overlaps existing', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue({ id: 'user-123' });
      
      // Mock existing overlapping availability
      availabilityRepository.createQueryBuilder().getMany = jest.fn().mockResolvedValue([
        {
          id: 'existing-avail',
          startTime: new Date('2025-12-01T08:00:00Z'),
          endTime: new Date('2025-12-01T12:00:00Z'),
        },
      ]);

      await expect(
        service.create({
          userId: 'user-123',
          startTime: '2025-12-01T10:00:00Z', // Overlaps
          endTime: '2025-12-01T14:00:00Z',
          type: AvailabilityType.PREFERRED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isAvailableForShift', () => {
    it('should return available=true for PREFERRED availability', () => {
      const availabilities: Availability[] = [
        {
          id: 'a1',
          userId: 'u1',
          startTime: new Date('2025-12-01T08:00:00Z'),
          endTime: new Date('2025-12-01T18:00:00Z'),
          type: AvailabilityType.PREFERRED,
          notes: null,
          recurrence: null,
          user: {} as User,
          createdAt: new Date(),
          updatedAt: new Date(),
          overlaps: jest.fn(),
          contains: function(start: Date, end: Date) {
            return this.startTime <= start && this.endTime >= end;
          },
        },
      ];

      const shiftStart = new Date('2025-12-01T09:00:00Z');
      const shiftEnd = new Date('2025-12-01T13:00:00Z');

      const result = service.isAvailableForShift(availabilities, shiftStart, shiftEnd);
      
      expect(result.available).toBe(true);
      expect(result.type).toBe(AvailabilityType.PREFERRED);
    });

    it('should return available=false for BLACKOUT availability', () => {
      const availabilities: Availability[] = [
        {
          id: 'a1',
          userId: 'u1',
          startTime: new Date('2025-12-01T08:00:00Z'),
          endTime: new Date('2025-12-01T18:00:00Z'),
          type: AvailabilityType.BLACKOUT,
          notes: null,
          recurrence: null,
          user: {} as User,
          createdAt: new Date(),
          updatedAt: new Date(),
          overlaps: jest.fn(),
          contains: function(start: Date, end: Date) {
            return this.startTime <= start && this.endTime >= end;
          },
        },
      ];

      const shiftStart = new Date('2025-12-01T09:00:00Z');
      const shiftEnd = new Date('2025-12-01T13:00:00Z');

      const result = service.isAvailableForShift(availabilities, shiftStart, shiftEnd);
      
      expect(result.available).toBe(false);
      expect(result.type).toBe(AvailabilityType.BLACKOUT);
    });

    it('should return available=false when no availability covers shift', () => {
      const availabilities: Availability[] = [];

      const shiftStart = new Date('2025-12-01T09:00:00Z');
      const shiftEnd = new Date('2025-12-01T13:00:00Z');

      const result = service.isAvailableForShift(availabilities, shiftStart, shiftEnd);
      
      expect(result.available).toBe(false);
      expect(result.type).toBeNull();
    });
  });
});

describe('Availability Parsing', () => {
  describe('ISO 8601 parsing', () => {
    it('should parse ISO date strings correctly', () => {
      const isoString = '2025-12-01T09:00:00+05:30';
      const date = new Date(isoString);
      
      expect(date.toISOString()).toContain('2025-12-01');
    });

    it('should handle UTC dates', () => {
      const utcString = '2025-12-01T09:00:00Z';
      const date = new Date(utcString);
      
      expect(date.getUTCHours()).toBe(9);
    });

    it('should handle timezone offsets', () => {
      const tzString = '2025-12-01T14:30:00+05:30';
      const date = new Date(tzString);
      
      // 14:30 IST = 09:00 UTC
      expect(date.getUTCHours()).toBe(9);
      expect(date.getUTCMinutes()).toBe(0);
    });
  });

  describe('Time range validation', () => {
    it('should detect overlapping time ranges', () => {
      const range1 = { start: new Date('2025-12-01T09:00'), end: new Date('2025-12-01T13:00') };
      const range2 = { start: new Date('2025-12-01T12:00'), end: new Date('2025-12-01T17:00') };
      
      const overlaps = range1.start < range2.end && range2.start < range1.end;
      expect(overlaps).toBe(true);
    });

    it('should detect non-overlapping time ranges', () => {
      const range1 = { start: new Date('2025-12-01T09:00'), end: new Date('2025-12-01T13:00') };
      const range2 = { start: new Date('2025-12-01T14:00'), end: new Date('2025-12-01T17:00') };
      
      const overlaps = range1.start < range2.end && range2.start < range1.end;
      expect(overlaps).toBe(false);
    });

    it('should handle edge case: adjacent time ranges', () => {
      const range1 = { start: new Date('2025-12-01T09:00'), end: new Date('2025-12-01T13:00') };
      const range2 = { start: new Date('2025-12-01T13:00'), end: new Date('2025-12-01T17:00') };
      
      // Adjacent ranges (end of one equals start of other) should NOT overlap
      const overlaps = range1.start < range2.end && range2.start < range1.end;
      expect(overlaps).toBe(false);
    });
  });
});

