import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async findOne(): Promise<Profile | null> {
    return this.profileRepo.findOne({ where: {}, order: { createdAt: 'ASC' } });
  }

  async update(dto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.profileRepo.findOne({ where: {}, order: { createdAt: 'ASC' } });
    if (!profile) {
      throw new NotFoundException('Profile belum dibuat. Jalankan seed terlebih dahulu.');
    }
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }
}
