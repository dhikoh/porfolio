import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Res,
  UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as crypto from 'crypto';
import { CoverLetterService } from './cover-letter.service';
import { CreateCoverLetterDto, UpdateCoverLetterDto } from './dto/cover-letter.dto';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg'];

const signatureStorage = diskStorage({
  destination: './uploads/signatures',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sig_${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const signatureFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Hanya file PNG atau JPG yang diizinkan'), false);
  }
};

@ApiTags('Cover Letter')
@Controller('cover-letter')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CoverLetterController {
  constructor(private readonly service: CoverLetterService) {}

  // ─── Static routes FIRST (before :id param routes) ───

  @Get()
  @ApiOperation({ summary: 'List all saved cover letters' })
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create and save cover letter' })
  async create(@Body() dto: CreateCoverLetterDto) {
    return this.service.create(dto);
  }

  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file', {
    storage: signatureStorage,
    fileFilter: signatureFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload signature image (PNG/JPG, max 2MB)' })
  @HttpCode(HttpStatus.OK)
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tanda tangan wajib diupload (PNG/JPG, max 2MB)');
    }
    return { signatureUrl: `uploads/signatures/${file.filename}` };
  }

  // ─── Parameterized routes AFTER static routes ───

  @Get(':id')
  @ApiOperation({ summary: 'Get single cover letter data' })
  async findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing cover letter' })
  async update(@Param('id') id: string, @Body() dto: UpdateCoverLetterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cover letter' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Surat lamaran berhasil dihapus' };
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate and download cover letter (PDF/DOCX)' })
  async generate(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const fmt = format === 'docx' ? 'docx' : 'pdf';
    const { buffer, filename, contentType } = await this.service.generate(id, fmt);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }
}
