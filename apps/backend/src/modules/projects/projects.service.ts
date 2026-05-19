import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  /** Public: list published & featured projects */
  async findPublished(featured?: boolean): Promise<Project[]> {
    const where: Record<string, unknown> = { status: ProjectStatus.PUBLISHED };
    if (featured !== undefined) where.featured = featured;
    return this.projectRepo.find({ where, order: { sortOrder: 'ASC' } });
  }

  /** Public: find project by slug */
  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { slug, status: ProjectStatus.PUBLISHED },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  /** Admin: list all projects including drafts */
  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({ order: { sortOrder: 'ASC' }, withDeleted: false });
  }

  /** Admin: find by id (including drafts) */
  async findById(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    await this.ensureSlugUnique(dto.slug);
    const project = this.projectRepo.create({
      ...dto,
      longDesc: dto.longDesc || '',
      domain: dto.domain || '',
      liveUrl: dto.liveUrl || '',
      githubUrl: dto.githubUrl || '',
      imageUrl: dto.imageUrl || '',
      videoUrl: dto.videoUrl || '',
      tags: dto.tags || '[]',
      featured: dto.featured || false,
      sortOrder: dto.sortOrder || 0,
      status: dto.status || ProjectStatus.PUBLISHED,
    });
    return this.projectRepo.save(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    if (dto.slug && dto.slug !== project.slug) {
      await this.ensureSlugUnique(dto.slug);
    }
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  /** Soft delete */
  async remove(id: string): Promise<void> {
    const project = await this.findById(id);
    await this.projectRepo.softRemove(project);
  }

  private async ensureSlugUnique(slug: string): Promise<void> {
    const existing = await this.projectRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" sudah digunakan`);
    }
  }
}
