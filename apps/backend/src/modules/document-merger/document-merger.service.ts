import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { MergedDocument } from '../../entities/merged-document.entity';

const MERGED_DIR = path.join(process.cwd(), 'uploads', 'merged');

@Injectable()
export class DocumentMergerService {
  constructor(
    @InjectRepository(MergedDocument) private readonly repo: Repository<MergedDocument>,
  ) {
    // Ensure directory exists
    if (!fs.existsSync(MERGED_DIR)) {
      fs.mkdirSync(MERGED_DIR, { recursive: true });
    }
  }

  async findAll(): Promise<MergedDocument[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<MergedDocument> {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Dokumen tidak ditemukan');
    return doc;
  }

  async getFile(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const doc = await this.findById(id);
    const filePath = path.join(process.cwd(), doc.outputPath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan di server');
    }
    return {
      buffer: fs.readFileSync(filePath),
      filename: `${doc.title}.pdf`,
    };
  }

  async merge(files: Express.Multer.File[], title?: string): Promise<MergedDocument> {
    if (!files || files.length < 2) {
      throw new BadRequestException('Minimal 2 file untuk digabungkan');
    }

    const mergedPdf = await PDFDocument.create();
    const sourceNames: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      sourceNames.push(file.originalname);

      if (ext === '.pdf') {
        // Direct PDF merge
        const pdfDoc = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Image → PDF page
        const page = mergedPdf.addPage([595.28, 841.89]); // A4
        let image;
        if (ext === '.png') {
          image = await mergedPdf.embedPng(file.buffer);
        } else {
          image = await mergedPdf.embedJpg(file.buffer);
        }
        // Fit image to page with margins
        const margin = 40;
        const maxW = page.getWidth() - margin * 2;
        const maxH = page.getHeight() - margin * 2;
        const scale = Math.min(maxW / image.width, maxH / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, {
          x: (page.getWidth() - w) / 2,
          y: (page.getHeight() - h) / 2,
          width: w,
          height: h,
        });
      } else {
        // Unsupported format — skip with warning
        console.warn(`Skipping unsupported file: ${file.originalname} (${ext})`);
      }
    }

    const pdfBytes = await mergedPdf.save();
    const filename = `merged_${crypto.randomBytes(8).toString('hex')}.pdf`;
    const outputPath = path.join('uploads', 'merged', filename);
    const fullPath = path.join(process.cwd(), outputPath);

    fs.writeFileSync(fullPath, pdfBytes);

    const docTitle = title || `Gabungan ${files.length} Dokumen`;
    const record = this.repo.create({
      title: docTitle,
      sourceFiles: JSON.stringify(sourceNames),
      outputPath,
      fileSize: pdfBytes.length,
      pageCount: mergedPdf.getPageCount(),
    });

    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    // Delete file from disk (no orphan)
    const filePath = path.join(process.cwd(), doc.outputPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.repo.remove(doc);
  }
}
