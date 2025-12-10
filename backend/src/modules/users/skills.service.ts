// backend/src/modules/users/skills.service.ts
// Service for skill management

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByIds(ids: string[]): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { id: In(ids) },
    });
  }

  async findByCodes(codes: string[]): Promise<Skill[]> {
    return this.skillRepository.find({
      where: { code: In(codes) },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async create(code: string, name: string, description?: string): Promise<Skill> {
    const skill = this.skillRepository.create({
      code,
      name,
      description,
    });
    const saved = await this.skillRepository.save(skill);
    this.logger.log(`Created skill ${saved.id} (${saved.code})`);
    return saved;
  }

  async validateSkillCodes(codes: string[]): Promise<boolean> {
    const skills = await this.findByCodes(codes);
    return skills.length === codes.length;
  }
}

