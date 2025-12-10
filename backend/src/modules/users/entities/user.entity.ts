// backend/src/modules/users/entities/user.entity.ts
// User entity with self-referential manager relationship and RBAC roles

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Team } from './team.entity';
import { Skill } from './skill.entity';
import { Availability } from '../../availability/entities/availability.entity';
import { Shift } from '../../roster/entities/shift.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['teamId', 'role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Self-referential: Employee's manager
  @ManyToOne(() => User, (user) => user.directReports, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: User | null;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  // Employees managed by this user
  @OneToMany(() => User, (user) => user.manager)
  directReports: User[];

  // Team membership
  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team | null;

  @Column({ type: 'uuid', nullable: true })
  teamId: string | null;

  // Skills possessed by this user
  @ManyToMany(() => Skill, (skill) => skill.users)
  @JoinTable({
    name: 'user_skills',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skills: Skill[];

  // Availability windows
  @OneToMany(() => Availability, (availability) => availability.user)
  availabilities: Availability[];

  // Assigned shifts
  @OneToMany(() => Shift, (shift) => shift.assignedUser)
  assignedShifts: Shift[];

  // Shift preferences (JSON: { "shift_morning": 10, "shift_evening": -5 })
  @Column({ type: 'jsonb', default: {} })
  shiftPreferences: Record<string, number>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

