import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from '../../entities/cover-letter.entity';
import { CreateCoverLetterDto } from './dto/cover-letter.dto';
import { generateCoverLetterPdf } from './generators/pdf.generator';
import { generateCoverLetterDocx } from './generators/docx.generator';

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectRepository(CoverLetter) private readonly repo: Repository<CoverLetter>,
  ) {}

  async findAll(): Promise<CoverLetter[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<CoverLetter> {
    const letter = await this.repo.findOne({ where: { id } });
    if (!letter) throw new NotFoundException('Surat lamaran tidak ditemukan');
    return letter;
  }

  async create(dto: CreateCoverLetterDto): Promise<CoverLetter> {
    const letter = this.repo.create({
      language: dto.language,
      position: dto.position,
      companyName: dto.companyName,
      formData: JSON.stringify(dto),
      signatureUrl: dto.signatureUrl || '',
    });
    return this.repo.save(letter);
  }

  async remove(id: string): Promise<void> {
    const letter = await this.findById(id);
    await this.repo.remove(letter);
  }

  async generate(id: string, format: 'pdf' | 'docx'): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const letter = await this.findById(id);
    const dto: CreateCoverLetterDto = JSON.parse(letter.formData);

    const safeCompany = dto.companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'docx') {
      const buffer = await generateCoverLetterDocx(dto);
      return {
        buffer,
        filename: `Surat_Lamaran_${safeCompany}_${dateStr}.docx`,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }

    const buffer = await generateCoverLetterPdf(dto);
    return {
      buffer,
      filename: `Surat_Lamaran_${safeCompany}_${dateStr}.pdf`,
      contentType: 'application/pdf',
    };
  }
}
