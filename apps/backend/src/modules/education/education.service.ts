import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Education } from '../../entities/education.entity';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';

@Injectable()
export class EducationService {
  constructor(@InjectRepository(Education) private readonly repo: Repository<Education>) {}

  async findAll(): Promise<Education[]> { return this.repo.find({ order: { sortOrder: 'ASC' } }); }

  async findById(id: string): Promise<Education> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Pendidikan tidak ditemukan');
    return item;
  }

  async create(dto: CreateEducationDto): Promise<Education> {
    return this.repo.save(this.repo.create({ ...dto, description: dto.description || '', sortOrder: dto.sortOrder ?? 0 }));
  }

  async update(id: string, dto: UpdateEducationDto): Promise<Education> {
    const item = await this.findById(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> { await this.repo.remove(await this.findById(id)); }
}
