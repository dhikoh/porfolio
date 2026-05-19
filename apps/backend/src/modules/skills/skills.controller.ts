import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all skills (public)' })
  async findAll() {
    return this.skillsService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create skill (admin)' })
  async create(@Body() dto: CreateSkillDto, @CurrentUser('id') userId: string) {
    const skill = await this.skillsService.create(dto);
    await this.auditService.log(userId, 'CREATE', 'Skill', skill.id, null, dto);
    return skill;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update skill (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSkillDto, @CurrentUser('id') userId: string) {
    const old = await this.skillsService.findById(id);
    const updated = await this.skillsService.update(id, dto);
    await this.auditService.log(userId, 'UPDATE', 'Skill', id, old, dto);
    return updated;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete skill (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.skillsService.remove(id);
    await this.auditService.log(userId, 'DELETE', 'Skill', id);
    return { message: 'Skill berhasil dihapus' };
  }
}
