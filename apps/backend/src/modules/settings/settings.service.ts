import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../../entities/site-setting.entity';

const SETTINGS_KEY_WHITELIST = [
  'site_title', 'site_description', 'footer_text',
  'whatsapp_number', 'whatsapp_message',
  'section_about_title', 'section_about_subtitle',
  'section_process_title', 'section_process_subtitle',
  'section_timeline_title', 'section_timeline_subtitle',
  'section_resume_title', 'section_resume_subtitle',
  'section_expertise_title', 'section_expertise_subtitle',
  'section_skills_title', 'section_skills_subtitle',
  'section_contact_title', 'section_contact_subtitle',
  'metaKeywords',
];

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(SiteSetting) private readonly repo: Repository<SiteSetting>) {}

  async findAll(): Promise<SiteSetting[]> {
    return this.repo.find();
  }

  async getMap(): Promise<Record<string, string>> {
    const settings = await this.repo.find();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return map;
  }

  async upsert(key: string, value: string): Promise<SiteSetting> {
    if (!SETTINGS_KEY_WHITELIST.includes(key)) {
      throw new BadRequestException(`Key "${key}" tidak diizinkan`);
    }

    let setting = await this.repo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.repo.create({ key, value });
    }
    return this.repo.save(setting);
  }

  async bulkUpsert(entries: { key: string; value: string }[]): Promise<SiteSetting[]> {
    const results: SiteSetting[] = [];
    for (const entry of entries) {
      results.push(await this.upsert(entry.key, entry.value));
    }
    return results;
  }
}
