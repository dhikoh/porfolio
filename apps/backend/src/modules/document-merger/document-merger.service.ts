import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { MergedDocument } from '../../entities/merged-document.entity';

const MERGED_DIR = path.join(process.cwd(), 'uploads', 'merged');

/** Watermark configuration — all values from frontend */
interface WatermarkConfig {
  text: string;
  xPercent: number;   // 0-100 — horizontal position (0=left, 100=right)
  yPercent: number;   // 0-100 — vertical position (0=top, 100=bottom)
  opacity: number;    // 0-100
  size: number;       // font size in pt
  rotation: number;   // degrees (-180 to 180)
}

@Injectable()
export class DocumentMergerService {
  constructor(
    @InjectRepository(MergedDocument) private readonly repo: Repository<MergedDocument>,
  ) {
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
    return { buffer: fs.readFileSync(filePath), filename: `${doc.title}.pdf` };
  }

  async merge(
    files: Express.Multer.File[],
    title?: string,
    watermark?: WatermarkConfig,
  ): Promise<MergedDocument> {
    if (!files || files.length < 2) {
      throw new BadRequestException('Minimal 2 file untuk digabungkan');
    }

    const mergedPdf = await PDFDocument.create();
    const sourceNames: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      sourceNames.push(file.originalname);

      if (ext === '.pdf') {
        const pdfDoc = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const page = mergedPdf.addPage([595.28, 841.89]); // A4
        const image = ext === '.png'
          ? await mergedPdf.embedPng(file.buffer)
          : await mergedPdf.embedJpg(file.buffer);
        const margin = 40;
        const maxW = page.getWidth() - margin * 2;
        const maxH = page.getHeight() - margin * 2;
        const scale = Math.min(maxW / image.width, maxH / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, {
          x: (page.getWidth() - w) / 2,
          y: (page.getHeight() - h) / 2,
          width: w, height: h,
        });
      }
    }

    // Apply watermark if text provided
    if (watermark?.text?.trim()) {
      await this.applyWatermark(mergedPdf, watermark);
    }

    const pdfBytes = await mergedPdf.save();
    const filename = `merged_${crypto.randomBytes(8).toString('hex')}.pdf`;
    const outputPath = path.join('uploads', 'merged', filename);
    fs.writeFileSync(path.join(process.cwd(), outputPath), pdfBytes);

    const record = this.repo.create({
      title: title || `Gabungan ${files.length} Dokumen`,
      sourceFiles: JSON.stringify(sourceNames),
      outputPath,
      fileSize: pdfBytes.length,
      pageCount: mergedPdf.getPageCount(),
    });
    return this.repo.save(record);
  }

  /**
   * Apply watermark using percentage-based coordinates.
   * xPercent/yPercent map to page dimensions.
   * Frontend canvas (0,0) = top-left, but PDF (0,0) = bottom-left,
   * so we invert Y: pdfY = pageHeight - (yPercent/100 * pageHeight)
   */
  private async applyWatermark(pdf: PDFDocument, config: WatermarkConfig): Promise<void> {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const clampedOpacity = Math.max(0, Math.min(100, config.opacity)) / 100;
    const color = rgb(0.5, 0.5, 0.5);
    const pages = pdf.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // Convert percentage to PDF coordinates
      const x = (config.xPercent / 100) * width;
      const pdfY = height - ((config.yPercent / 100) * height); // invert Y axis

      page.drawText(config.text, {
        x,
        y: pdfY,
        size: config.size,
        font,
        color,
        opacity: clampedOpacity,
        rotate: degrees(config.rotation),
      });
    }
  }

  /**
   * Compress an existing merged PDF using Ghostscript
   */
  async compress(
    id: string,
    quality: number,
    targetSizeMB?: number,
  ): Promise<{ originalSize: number; compressedSize: number; reduction: string }> {
    const doc = await this.findById(id);
    const inputPath = path.join(process.cwd(), doc.outputPath);

    if (!fs.existsSync(inputPath)) {
      throw new NotFoundException('File sumber tidak ditemukan');
    }

    const originalSize = fs.statSync(inputPath).size;
    const clampedQuality = Math.max(10, Math.min(100, quality));
    const dpi = Math.round((clampedQuality / 100) * 300);
    const preset = this.getGsPreset(clampedQuality);
    const tempOutput = inputPath.replace('.pdf', `_compressed_${Date.now()}.pdf`);

    try {
      const gsCmd = [
        'gs', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${preset}`,
        `-dDownsampleColorImages=true`, `-dColorImageResolution=${dpi}`,
        `-dDownsampleGrayImages=true`, `-dGrayImageResolution=${dpi}`,
        `-dDownsampleMonoImages=true`, `-dMonoImageResolution=${dpi}`,
        '-dNOPAUSE', '-dBATCH', '-dQUIET',
        `-sOutputFile=${tempOutput}`, inputPath,
      ].join(' ');

      execSync(gsCmd, { timeout: 120000 });
      const compressedSize = fs.statSync(tempOutput).size;
      const targetBytes = targetSizeMB ? targetSizeMB * 1024 * 1024 : 0;

      // Retry with lower quality if target not met
      if (targetBytes > 0 && compressedSize > targetBytes && clampedQuality > 20) {
        fs.unlinkSync(tempOutput);
        return this.compress(id, Math.max(10, Math.round(clampedQuality * 0.6)), targetSizeMB);
      }

      // Replace original
      fs.unlinkSync(inputPath);
      fs.renameSync(tempOutput, inputPath);
      doc.fileSize = compressedSize;
      await this.repo.save(doc);

      const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      return { originalSize, compressedSize, reduction: `${reduction}%` };
    } catch {
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      throw new BadRequestException('Gagal mengompresi PDF. Pastikan Ghostscript terinstal.');
    }
  }

  private getGsPreset(quality: number): string {
    if (quality <= 25) return '/screen';
    if (quality <= 50) return '/ebook';
    if (quality <= 75) return '/printer';
    return '/prepress';
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    const filePath = path.join(process.cwd(), doc.outputPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await this.repo.remove(doc);
  }
}
