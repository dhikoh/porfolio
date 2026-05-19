import {
  Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly service: MediaService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all media (admin)' })
  async findAll() {
    return this.service.findAll();
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file (admin)' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 500 * 1024 * 1024 },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new Error('File wajib diupload');
    const media = await this.service.upload(file, userId);
    await this.auditService.log(userId, 'UPLOAD', 'Media', media.id, null, { filename: media.filename });
    return media;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.service.remove(id);
    await this.auditService.log(userId, 'DELETE', 'Media', id);
    return { message: 'Media berhasil dihapus' };
  }
}
