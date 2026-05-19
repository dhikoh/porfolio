import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../../entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  async findAll(): Promise<Skill[]> {
    return this.skillRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill tidak ditemukan');
    return skill;
  }

  async create(dto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepo.create({
      ...dto,
      level: dto.level ?? 80,
      icon: dto.icon || '',
      description: dto.description || '',
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.skillRepo.save(skill);
  }

  async update(id: string, dto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findById(id);
    Object.assign(skill, dto);
    return this.skillRepo.save(skill);
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findById(id);
    await this.skillRepo.remove(skill);
  }
}
