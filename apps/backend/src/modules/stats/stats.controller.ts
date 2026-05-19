import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { CreateStatDto, UpdateStatDto } from './dto/stat.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Stats') @Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService, private readonly auditService: AuditService) {}
  @Get() @ApiOperation({ summary: 'List stats (public)' }) async findAll() { return this.service.findAll(); }
  @Post() @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Create stat (admin)' })
  async create(@Body() dto: CreateStatDto, @CurrentUser('id') userId: string) { const i = await this.service.create(dto); await this.auditService.log(userId, 'CREATE', 'Stat', i.id, null, dto); return i; }
  @Patch(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Update stat (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateStatDto, @CurrentUser('id') userId: string) { const old = await this.service.findById(id); const u = await this.service.update(id, dto); await this.auditService.log(userId, 'UPDATE', 'Stat', id, old, dto); return u; }
  @Delete(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Delete stat (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.remove(id); await this.auditService.log(userId, 'DELETE', 'Stat', id); return { message: 'Stat berhasil dihapus' }; }
}
