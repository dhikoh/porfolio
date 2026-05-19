import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '../../entities/experience.entity';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(@InjectRepository(Experience) private readonly repo: Repository<Experience>) {}

  async findAll(): Promise<Experience[]> {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  async findById(id: string): Promise<Experience> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Pengalaman tidak ditemukan');
    return item;
  }

  async create(dto: CreateExperienceDto): Promise<Experience> {
    return this.repo.save(this.repo.create({
      ...dto,
      location: dto.location || '',
      endDate: dto.endDate || '',
      current: dto.current || false,
      description: dto.description || '',
      highlights: dto.highlights || '[]',
      sortOrder: dto.sortOrder ?? 0,
    }));
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<Experience> {
    const item = await this.findById(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.repo.remove(item);
  }
}
