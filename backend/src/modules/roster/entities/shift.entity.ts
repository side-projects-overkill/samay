// backend/src/modules/roster/entities/shift.entity.ts
// Shift entity with optimistic locking via @VersionColumn

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../users/entities/team.entity';

export enum ShiftStatus {
  OPEN = 'OPEN', // Unassigned, available for scheduling
  ASSIGNED = 'ASSIGNED', // Assigned to an employee
  CONFIRMED = 'CONFIRMED', // Employee confirmed
  IN_PROGRESS = 'IN_PROGRESS', // Currently active
  COMPLETED = 'COMPLETED', // Finished
  CANCELLED = 'CANCELLED', // Cancelled
}

@Entity('shifts')
@Index(['teamId', 'date', 'status'])
@Index(['assignedUserId', 'date'])
@Index(['date', 'startTime', 'endTime'])
@Check(`"endTime" > "startTime"`)
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Optimistic locking for concurrent updates
  @VersionColumn()
  version: number;

  @ManyToOne(() => Team, (team) => team.shifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD format

  @Column({ type: 'time' })
  startTime: string; // HH:MM format

  @Column({ type: 'time' })
  endTime: string; // HH:MM format

  // Full timestamp versions for calculations
  @Column({ type: 'timestamptz' })
  startDateTime: Date;

  @Column({ type: 'timestamptz' })
  endDateTime: Date;

  @Column({ length: 50 })
  shiftCode: string; // e.g., "shift_morning", "shift_evening"

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  durationHours: number;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.OPEN,
  })
  status: ShiftStatus;

  // Required skills for this shift (stored as skill codes)
  @Column({ type: 'jsonb', default: [] })
  requiredSkills: string[];

  // Assigned employee (nullable for open shifts)
  @ManyToOne(() => User, (user) => user.assignedShifts, { nullable: true })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: User | null;

  @Column({ type: 'uuid', nullable: true })
  assignedUserId: string | null;

  // Assignment metadata
  @Column({ type: 'timestamptz', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignmentSource: string | null;

  // Shift-specific notes
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Additional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Check if shift overlaps with another time range
  overlapsTime(start: Date, end: Date): boolean {
    return this.startDateTime < end && this.endDateTime > start;
  }
}

