import {
  Controller, Get, Post, Delete, Param, Query, Res, Body,
  UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentMergerService } from './document-merger.service';

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
  @UseInterceptors(FilesInterceptor('files', 20)) // max 20 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload files and merge into single PDF' })
  async merge(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('title') title?: string,
  ) {
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
