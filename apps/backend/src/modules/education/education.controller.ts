import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EducationService } from './education.service';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Education')
@Controller('education')
export class EducationController {
  constructor(private readonly service: EducationService, private readonly auditService: AuditService) {}

  @Get() @ApiOperation({ summary: 'List education (public)' })
  async findAll() { return this.service.findAll(); }

  @Post() @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Create education (admin)' })
  async create(@Body() dto: CreateEducationDto, @CurrentUser('id') userId: string) {
    const item = await this.service.create(dto);
    await this.auditService.log(userId, 'CREATE', 'Education', item.id, null, dto);
    return item;
  }

  @Patch(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Update education (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateEducationDto, @CurrentUser('id') userId: string) {
    const old = await this.service.findById(id);
    const updated = await this.service.update(id, dto);
    await this.auditService.log(userId, 'UPDATE', 'Education', id, old, dto);
    return updated;
  }

  @Delete(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Delete education (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.service.remove(id);
    await this.auditService.log(userId, 'DELETE', 'Education', id);
    return { message: 'Pendidikan berhasil dihapus' };
  }
}
