import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessStep } from '../../entities/process-step.entity';
import { CreateProcessStepDto, UpdateProcessStepDto } from './dto/process-step.dto';

@Injectable()
export class ProcessStepsService {
  constructor(@InjectRepository(ProcessStep) private readonly repo: Repository<ProcessStep>) {}
  async findAll() { return this.repo.find({ order: { sortOrder: 'ASC' } }); }
  async findById(id: string) { const i = await this.repo.findOne({ where: { id } }); if (!i) throw new NotFoundException('Process step tidak ditemukan'); return i; }
  async create(dto: CreateProcessStepDto) { return this.repo.save(this.repo.create({ ...dto, description: dto.description || '', sortOrder: dto.sortOrder ?? 0 })); }
  async update(id: string, dto: UpdateProcessStepDto) { const i = await this.findById(id); Object.assign(i, dto); return this.repo.save(i); }
  async remove(id: string) { await this.repo.remove(await this.findById(id)); }
}
