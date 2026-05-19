import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { MergedDocument } from '../../entities/merged-document.entity';

const MERGED_DIR = path.join(process.cwd(), 'uploads', 'merged');

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
    return {
      buffer: fs.readFileSync(filePath),
      filename: `${doc.title}.pdf`,
    };
  }

  async merge(
    files: Express.Multer.File[],
    title?: string,
    watermarkText?: string,
    watermarkPosition?: string,
    watermarkOpacity?: number,
    watermarkSize?: number,
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
        let image;
        if (ext === '.png') {
          image = await mergedPdf.embedPng(file.buffer);
        } else {
          image = await mergedPdf.embedJpg(file.buffer);
        }
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
        console.warn(`Skipping unsupported file: ${file.originalname} (${ext})`);
      }
    }

    // Apply watermark to all pages if provided
    if (watermarkText && watermarkText.trim()) {
      await this.applyWatermark(
        mergedPdf,
        watermarkText.trim(),
        watermarkPosition || 'bottom-center',
        watermarkOpacity ?? 30,
        watermarkSize || 8,
      );
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

  /**
   * Apply watermark text to every page with configurable options
   * @param position: top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right, diagonal
   * @param opacity: 0-100 (percentage)
   * @param fontSize: pt size
   */
  private async applyWatermark(
    pdf: PDFDocument,
    text: string,
    position = 'bottom-center',
    opacity = 30,
    fontSize = 8,
  ): Promise<void> {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const clampedOpacity = Math.max(0, Math.min(100, opacity)) / 100;
    const color = rgb(0.5, 0.5, 0.5);
    const pages = pdf.getPages();
    const margin = 20;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = fontSize;

      let x: number;
      let y: number;
      let rotate: ReturnType<typeof import('pdf-lib').degrees> | undefined;

      switch (position) {
        case 'top-left':
          x = margin;
          y = height - margin - textHeight;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - margin - textHeight;
          break;
        case 'top-right':
          x = width - margin - textWidth;
          y = height - margin - textHeight;
          break;
        case 'center':
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
        case 'bottom-left':
          x = margin;
          y = margin;
          break;
        case 'bottom-right':
          x = width - margin - textWidth;
          y = margin;
          break;
        case 'diagonal': {
          // Diagonal across the page — draw larger text rotated 45°
          const diagSize = Math.max(fontSize, 24);
          const diagWidth = font.widthOfTextAtSize(text, diagSize);
          x = (width - diagWidth) / 2;
          y = height / 2;
          const { degrees } = await import('pdf-lib');
          rotate = degrees(45);
          page.drawText(text, {
            x, y, size: diagSize, font, color, opacity: clampedOpacity, rotate,
          });
          continue; // skip default drawText below
        }
        case 'bottom-center':
        default:
          x = (width - textWidth) / 2;
          y = margin;
          break;
      }

      page.drawText(text, {
        x, y, size: fontSize, font, color, opacity: clampedOpacity,
      });
    }
  }

  /**
   * Compress an existing merged PDF using Ghostscript
   * @param quality 1-100 percentage (lower = smaller file, lower quality)
   * @param targetSizeMB optional target file size in MB
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

    // Map quality percentage to Ghostscript DPI
    const clampedQuality = Math.max(10, Math.min(100, quality));
    const dpi = Math.round((clampedQuality / 100) * 300); // 10% = 30dpi, 100% = 300dpi
    const preset = this.getGsPreset(clampedQuality);

    // Ghostscript compress
    const tempOutput = inputPath.replace('.pdf', `_compressed_${Date.now()}.pdf`);

    try {
      const gsCmd = [
        'gs',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${preset}`,
        `-dDownsampleColorImages=true`,
        `-dColorImageResolution=${dpi}`,
        `-dDownsampleGrayImages=true`,
        `-dGrayImageResolution=${dpi}`,
        `-dDownsampleMonoImages=true`,
        `-dMonoImageResolution=${dpi}`,
        '-dNOPAUSE',
        '-dBATCH',
        '-dQUIET',
        `-sOutputFile=${tempOutput}`,
        inputPath,
      ].join(' ');

      execSync(gsCmd, { timeout: 120000 }); // 2 min timeout

      const compressedSize = fs.statSync(tempOutput).size;
      const targetBytes = targetSizeMB ? targetSizeMB * 1024 * 1024 : 0;

      // If target set and still too large, try more aggressive compression
      if (targetBytes > 0 && compressedSize > targetBytes && clampedQuality > 20) {
        fs.unlinkSync(tempOutput);
        // Recursive call with lower quality
        const lowerQuality = Math.max(10, Math.round(clampedQuality * 0.6));
        return this.compress(id, lowerQuality, targetSizeMB);
      }

      // Replace original with compressed
      fs.unlinkSync(inputPath);
      fs.renameSync(tempOutput, inputPath);

      // Update record
      doc.fileSize = compressedSize;
      await this.repo.save(doc);

      const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      return {
        originalSize,
        compressedSize,
        reduction: `${reduction}%`,
      };
    } catch (err) {
      // Clean up temp file on error
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      throw new BadRequestException(
        'Gagal mengompresi PDF. Pastikan Ghostscript terinstal di server.',
      );
    }
  }

  /**
   * Map quality percentage to Ghostscript preset
   */
  private getGsPreset(quality: number): string {
    if (quality <= 25) return '/screen';      // 72dpi — smallest
    if (quality <= 50) return '/ebook';       // 150dpi — medium
    if (quality <= 75) return '/printer';     // 300dpi — good
    return '/prepress';                        // 300dpi+ — best
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    const filePath = path.join(process.cwd(), doc.outputPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.repo.remove(doc);
  }
}
