import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProcessStepsService } from './process-steps.service';
import { CreateProcessStepDto, UpdateProcessStepDto } from './dto/process-step.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Process Steps') @Controller('process-steps')
export class ProcessStepsController {
  constructor(private readonly service: ProcessStepsService, private readonly auditService: AuditService) {}
  @Get() @ApiOperation({ summary: 'List process steps (public)' }) async findAll() { return this.service.findAll(); }
  @Post() @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Create process step (admin)' })
  async create(@Body() dto: CreateProcessStepDto, @CurrentUser('id') userId: string) { const i = await this.service.create(dto); await this.auditService.log(userId, 'CREATE', 'ProcessStep', i.id, null, dto); return i; }
  @Patch(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Update process step (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProcessStepDto, @CurrentUser('id') userId: string) { const old = await this.service.findById(id); const u = await this.service.update(id, dto); await this.auditService.log(userId, 'UPDATE', 'ProcessStep', id, old, dto); return u; }
  @Delete(':id') @UseGuards(AuthGuard('jwt')) @ApiBearerAuth() @ApiOperation({ summary: 'Delete process step (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.remove(id); await this.auditService.log(userId, 'DELETE', 'ProcessStep', id); return { message: 'Process step berhasil dihapus' }; }
}
