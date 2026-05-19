import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TimelineService } from './timeline.service';
import { CreateTimelineDto, UpdateTimelineDto } from './dto/timeline.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Timeline') @Controller('timeline')
export class TimelineController {
  constructor(private readonly service: TimelineService, private readonly auditService: AuditService) {}
  @Get() @ApiOperation({ summary: 'List timeline (public)' }) async findAll() { return this.service.findAll(); }
  @Post() @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Create timeline (admin)' })
  async create(@Body() dto: CreateTimelineDto, @CurrentUser('id') userId: string) { const i = await this.service.create(dto); await this.auditService.log(userId, 'CREATE', 'Timeline', i.id, null, dto); return i; }
  @Patch(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Update timeline (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateTimelineDto, @CurrentUser('id') userId: string) { const old = await this.service.findById(id); const u = await this.service.update(id, dto); await this.auditService.log(userId, 'UPDATE', 'Timeline', id, old, dto); return u; }
  @Delete(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Delete timeline (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.remove(id); await this.auditService.log(userId, 'DELETE', 'Timeline', id); return { message: 'Timeline berhasil dihapus' }; }
}
