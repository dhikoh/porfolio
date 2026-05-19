import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private readonly repo: Repository<Message>) {}

  async findAll(): Promise<Message[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Message> {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('Pesan tidak ditemukan');
    return msg;
  }

  async create(dto: CreateMessageDto): Promise<Message> {
    return this.repo.save(this.repo.create({
      ...dto,
      phone: dto.phone || '',
    }));
  }

  async update(id: string, dto: UpdateMessageDto): Promise<Message> {
    const msg = await this.findById(id);
    msg.isRead = dto.isRead;
    return this.repo.save(msg);
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(await this.findById(id));
  }

  async getUnreadCount(): Promise<number> {
    return this.repo.count({ where: { isRead: false } });
  }
}
