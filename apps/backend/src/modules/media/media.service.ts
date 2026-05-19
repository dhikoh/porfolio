import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../entities/media.entity';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';

const UPLOAD_BASE = path.join(process.cwd(), 'uploads');
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC = ['application/pdf'];
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 500 * 1024 * 1024;
const MAX_DOC = 20 * 1024 * 1024;

type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

function getMediaType(mime: string): MediaType | null {
  if (ALLOWED_IMAGE.includes(mime)) return 'IMAGE';
  if (ALLOWED_VIDEO.includes(mime)) return 'VIDEO';
  if (ALLOWED_DOC.includes(mime)) return 'DOCUMENT';
  return null;
}

function getSubDir(type: MediaType): string {
  return type === 'IMAGE' ? 'images' : type === 'VIDEO' ? 'videos' : 'documents';
}

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private readonly repo: Repository<Media>) {}

  async findAll(): Promise<Media[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async upload(file: Express.Multer.File, userId: string): Promise<Media> {
    const type = getMediaType(file.mimetype);
    if (!type) throw new BadRequestException(`Tipe file tidak didukung: ${file.mimetype}`);

    const maxSize = type === 'IMAGE' ? MAX_IMAGE : type === 'VIDEO' ? MAX_VIDEO : MAX_DOC;
    if (file.size > maxSize) {
      throw new BadRequestException(`File melebihi batas ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    const subDir = getSubDir(type);
    const dir = path.join(UPLOAD_BASE, subDir);
    await fs.mkdir(dir, { recursive: true });

    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const filename = `${Date.now()}-${sanitized}`;
    const filepath = path.join(dir, filename);

    // Image optimization: convert to WebP if applicable
    if (type === 'IMAGE' && !file.mimetype.includes('svg')) {
      const optimized = await sharp(file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
      await fs.writeFile(path.join(dir, webpFilename), optimized);

      return this.repo.save(this.repo.create({
        filename: webpFilename,
        url: `/uploads/${subDir}/${webpFilename}`,
        type,
        mimeType: 'image/webp',
        size: optimized.length,
        uploadedBy: userId,
      }));
    }

    await fs.writeFile(filepath, file.buffer);

    return this.repo.save(this.repo.create({
      filename,
      url: `/uploads/${subDir}/${filename}`,
      type,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: userId,
    }));
  }

  async remove(id: string): Promise<void> {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media tidak ditemukan');

    // Delete file from filesystem
    const filepath = path.join(UPLOAD_BASE, '..', media.url);
    try { await fs.unlink(filepath); } catch { /* file might not exist */ }

    await this.repo.remove(media);
  }
}
