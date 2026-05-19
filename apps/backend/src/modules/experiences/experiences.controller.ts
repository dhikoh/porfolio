import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly service: ExperiencesService, private readonly auditService: AuditService) {}

  @Get() @ApiOperation({ summary: 'List experiences (public)' })
  async findAll() { return this.service.findAll(); }

  @Post() @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Create experience (admin)' })
  async create(@Body() dto: CreateExperienceDto, @CurrentUser('id') userId: string) {
    const item = await this.service.create(dto);
    await this.auditService.log(userId, 'CREATE', 'Experience', item.id, null, dto);
    return item;
  }

  @Patch(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Update experience (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateExperienceDto, @CurrentUser('id') userId: string) {
    const old = await this.service.findById(id);
    const updated = await this.service.update(id, dto);
    await this.auditService.log(userId, 'UPDATE', 'Experience', id, old, dto);
    return updated;
  }

  @Delete(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Delete experience (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.service.remove(id);
    await this.auditService.log(userId, 'DELETE', 'Experience', id);
    return { message: 'Pengalaman berhasil dihapus' };
  }
}
