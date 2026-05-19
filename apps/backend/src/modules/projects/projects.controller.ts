import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../../common/services/audit.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List published projects (public)' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async findPublished(@Query('featured') featured?: string) {
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.projectsService.findPublished(isFeatured);
  }

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all projects including drafts (admin)' })
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get project by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create project (admin)' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    const project = await this.projectsService.create(dto);
    await this.auditService.log(userId, 'CREATE', 'Project', project.id, null, dto);
    return project;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    const old = await this.projectsService.findById(id);
    const updated = await this.projectsService.update(id, dto);
    await this.auditService.log(userId, 'UPDATE', 'Project', id, old, dto);
    return updated;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete project (admin)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.projectsService.remove(id);
    await this.auditService.log(userId, 'DELETE', 'Project', id);
    return { message: 'Project berhasil dihapus' };
  }
}
