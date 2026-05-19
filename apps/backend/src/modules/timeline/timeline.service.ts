import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from '../../entities/timeline.entity';
import { CreateTimelineDto, UpdateTimelineDto } from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(@InjectRepository(Timeline) private readonly repo: Repository<Timeline>) {}
  async findAll() { return this.repo.find({ order: { sortOrder: 'ASC' } }); }
  async findById(id: string) { const i = await this.repo.findOne({ where: { id } }); if (!i) throw new NotFoundException('Timeline tidak ditemukan'); return i; }
  async create(dto: CreateTimelineDto) { return this.repo.save(this.repo.create({ ...dto, description: dto.description || '', sortOrder: dto.sortOrder ?? 0 })); }
  async update(id: string, dto: UpdateTimelineDto) { const i = await this.findById(id); Object.assign(i, dto); return this.repo.save(i); }
  async remove(id: string) { await this.repo.remove(await this.findById(id)); }
}
