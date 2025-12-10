// backend/src/modules/users/entities/skill.entity.ts
// Skill entity for competency tracking

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('skills')
@Index(['code'], { unique: true })
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  code: string; // e.g., "skill_forklift", "skill_cashier"

  @Column({ length: 100 })
  name: string; // Human-readable name

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  isActive: boolean;

  // Users possessing this skill
  @ManyToMany(() => User, (user) => user.skills)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}

