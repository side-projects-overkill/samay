// backend/src/modules/users/entities/team.entity.ts
// Team entity representing organizational units

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Shift } from '../../roster/entities/shift.entity';

@Entity('teams')
@Index(['name'], { unique: true })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  isActive: boolean;

  // Team members
  @OneToMany(() => User, (user) => user.team)
  members: User[];

  // Shifts belonging to this team
  @OneToMany(() => Shift, (shift) => shift.team)
  shifts: Shift[];

  // Team-specific settings (JSON)
  @Column({ type: 'jsonb', default: {} })
  settings: {
    maxShiftsPerDay?: number;
    minRestHours?: number;
    defaultShiftDuration?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

