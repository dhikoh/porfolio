import {
  Controller, Get, Post, Delete, Param, Body, Query, Res,
  UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as crypto from 'crypto';
import { CoverLetterService } from './cover-letter.service';
import { CreateCoverLetterDto } from './dto/cover-letter.dto';

const signatureStorage = diskStorage({
  destination: './uploads/signatures',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sig_${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

@ApiTags('Cover Letter')
@Controller('cover-letter')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CoverLetterController {
  constructor(private readonly service: CoverLetterService) {}

  @Get()
  @ApiOperation({ summary: 'List all saved cover letters' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single cover letter data' })
  async findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create and save cover letter' })
  async create(@Body() dto: CreateCoverLetterDto) {
    return this.service.create(dto);
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

  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file', { storage: signatureStorage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload signature image' })
  @HttpCode(HttpStatus.OK)
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    return { signatureUrl: `uploads/signatures/${file.filename}` };
  }
}
