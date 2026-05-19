import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stat } from '../../entities/stat.entity';
import { CreateStatDto, UpdateStatDto } from './dto/stat.dto';

@Injectable()
export class StatsService {
  constructor(@InjectRepository(Stat) private readonly repo: Repository<Stat>) {}
  async findAll() { return this.repo.find({ order: { sortOrder: 'ASC' } }); }
  async findById(id: string) { const i = await this.repo.findOne({ where: { id } }); if (!i) throw new NotFoundException('Stat tidak ditemukan'); return i; }
  async create(dto: CreateStatDto) { return this.repo.save(this.repo.create({ ...dto, icon: dto.icon || '', sortOrder: dto.sortOrder ?? 0 })); }
  async update(id: string, dto: UpdateStatDto) { const i = await this.findById(id); Object.assign(i, dto); return this.repo.save(i); }
  async remove(id: string) { await this.repo.remove(await this.findById(id)); }
}
