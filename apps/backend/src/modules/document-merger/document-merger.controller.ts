import {
  Controller, Get, Post, Delete, Param, Res, Body,
  UseGuards, UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { DocumentMergerService } from './document-merger.service';

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const mergerFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`Tipe file tidak didukung: ${file.originalname}. Hanya PDF, JPG, PNG.`), false);
  }
};

@ApiTags('Document Merger')
@Controller('document-merger')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DocumentMergerController {
  constructor(private readonly service: DocumentMergerService) {}

  @Get()
  @ApiOperation({ summary: 'List all merged documents' })
  async findAll() {
    return this.service.findAll();
  }

  @Post('merge')
  @SkipThrottle()
  @UseInterceptors(FilesInterceptor('files', 20, {
    storage: memoryStorage(),
    fileFilter: mergerFileFilter,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max per file
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload files and merge into single PDF' })
  async merge(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('title') title?: string,
  ) {
    if (!files || files.length < 2) {
      throw new BadRequestException('Minimal 2 file untuk digabungkan');
    }
    return this.service.merge(files, title);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download merged PDF' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.getFile(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete merged document and file' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Dokumen berhasil dihapus' };
  }
}
