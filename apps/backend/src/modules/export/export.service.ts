import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../entities/profile.entity';
import { Experience } from '../../entities/experience.entity';
import { Education } from '../../entities/education.entity';
import { Skill } from '../../entities/skill.entity';
import { Project, ProjectStatus } from '../../entities/project.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Experience) private expRepo: Repository<Experience>,
    @InjectRepository(Education) private eduRepo: Repository<Education>,
    @InjectRepository(Skill) private skillRepo: Repository<Skill>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
  ) {}

  async generateCVHtml(): Promise<string> {
    const profile = await this.profileRepo.findOne({ where: {} });
    const experiences = await this.expRepo.find({ order: { sortOrder: 'ASC' } });
    const education = await this.eduRepo.find({ order: { sortOrder: 'ASC' } });
    const skills = await this.skillRepo.find({ where: { category: 'technical' }, order: { sortOrder: 'ASC' } });
    const projects = await this.projectRepo.find({ where: { status: ProjectStatus.PUBLISHED }, order: { sortOrder: 'ASC' } });

    const escapeHtml = (str: string) => str?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '';

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${escapeHtml(profile?.fullName || 'Portfolio')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 30px; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    h2 { font-size: 16px; color: #555; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
    h3 { font-size: 14px; margin-bottom: 2px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header .tagline { color: #666; font-size: 14px; }
    .contact { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
    .contact span { margin: 0 8px; }
    .summary { font-size: 13px; color: #444; margin-bottom: 16px; text-align: justify; }
    .item { margin-bottom: 12px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-header .title { font-weight: 600; font-size: 14px; }
    .item-header .date { font-size: 12px; color: #888; }
    .item-sub { font-size: 13px; color: #555; }
    .item-desc { font-size: 12px; color: #666; margin-top: 4px; }
    ul { padding-left: 20px; font-size: 12px; color: #555; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #f0f0f0; padding: 3px 10px; border-radius: 12px; font-size: 11px; }
    .projects-list .project { margin-bottom: 8px; }
    .project-title { font-size: 13px; font-weight: 600; }
    .project-desc { font-size: 11px; color: #666; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(profile?.fullName || '')}</h1>
    <div class="tagline">${escapeHtml(profile?.tagline || '')}</div>
  </div>
  <div class="contact">
    ${profile?.email ? `<span>${escapeHtml(profile.email)}</span>` : ''}
    ${profile?.phone ? `<span>${escapeHtml(profile.phone)}</span>` : ''}
    ${profile?.address ? `<span>${escapeHtml(profile.address)}</span>` : ''}
  </div>

  ${profile?.summary ? `<h2>Profil</h2><div class="summary">${escapeHtml(profile.summary)}</div>` : ''}

  ${experiences.length > 0 ? `<h2>Pengalaman</h2>${experiences.map(e => `
  <div class="item">
    <div class="item-header">
      <span class="title">${escapeHtml(e.title)}</span>
      <span class="date">${escapeHtml(e.startDate)}${e.current ? ' - Sekarang' : e.endDate ? ` - ${escapeHtml(e.endDate)}` : ''}</span>
    </div>
    <div class="item-sub">${escapeHtml(e.company)}${e.location ? ` — ${escapeHtml(e.location)}` : ''}</div>
    ${e.description ? `<div class="item-desc">${escapeHtml(e.description)}</div>` : ''}
    ${(() => { try { const h = JSON.parse(e.highlights || '[]'); return h.length ? `<ul>${h.map((x: string) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''; } catch { return ''; } })()}
  </div>`).join('')}` : ''}

  ${education.length > 0 ? `<h2>Pendidikan</h2>${education.map(e => `
  <div class="item">
    <div class="item-header">
      <span class="title">${escapeHtml(e.degree)}</span>
      <span class="date">${e.year}</span>
    </div>
    <div class="item-sub">${escapeHtml(e.institution)}</div>
    ${e.description ? `<div class="item-desc">${escapeHtml(e.description)}</div>` : ''}
  </div>`).join('')}` : ''}

  ${skills.length > 0 ? `<h2>Keahlian</h2><div class="skills-grid">${skills.map(s => `<span class="skill-tag">${escapeHtml(s.name)} (${s.level}%)</span>`).join('')}</div>` : ''}

  ${projects.length > 0 ? `<h2>Proyek</h2><div class="projects-list">${projects.map(p => `
  <div class="project">
    <span class="project-title">${escapeHtml(p.title)}</span>${p.domain ? ` — <span style="font-size:11px;color:#888">${escapeHtml(p.domain)}</span>` : ''}
    <div class="project-desc">${escapeHtml(p.description)}</div>
  </div>`).join('')}</div>` : ''}

</body>
</html>`;
  }
}
