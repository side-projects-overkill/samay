// backend/src/modules/availability/entities/availability.entity.ts
// Availability entity tracking employee time windows

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AvailabilityType {
  PREFERRED = 'PREFERRED', // Employee prefers to work
  NEUTRAL = 'NEUTRAL', // Available but no preference
  AVOIDED = 'AVOIDED', // Would rather not work but can
  BLACKOUT = 'BLACKOUT', // Cannot work (hard constraint)
}

@Entity('availabilities')
@Index(['userId', 'startTime', 'endTime'])
@Index(['startTime', 'endTime'])
@Check(`"endTime" > "startTime"`)
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AvailabilityType,
    default: AvailabilityType.NEUTRAL,
  })
  type: AvailabilityType;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Recurring pattern (optional)
  @Column({ type: 'jsonb', nullable: true })
  recurrence: {
    pattern: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 for weekly
    endDate?: string;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Check if this availability overlaps with a given time range
  overlaps(start: Date, end: Date): boolean {
    return this.startTime < end && this.endTime > start;
  }

  // Check if this availability fully contains a given time range
  contains(start: Date, end: Date): boolean {
    return this.startTime <= start && this.endTime >= end;
  }
}

