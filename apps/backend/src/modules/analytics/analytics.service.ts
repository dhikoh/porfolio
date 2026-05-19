import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { PageView } from '../../entities/page-view.entity';
import { TrackPageViewDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(@InjectRepository(PageView) private readonly repo: Repository<PageView>) {}

  async track(dto: TrackPageViewDto): Promise<void> {
    await this.repo.save(this.repo.create({
      path: dto.path,
      userAgent: dto.userAgent || '',
      referrer: dto.referrer || '',
      ip: dto.ip || '',
    }));
  }

  async getSummary(): Promise<{
    totalViews: number;
    todayViews: number;
    topPages: { path: string; count: number }[];
    recentViews: PageView[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalViews, todayViews, topPages, recentViews] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { createdAt: MoreThanOrEqual(today) } }),
      this.repo
        .createQueryBuilder('pv')
        .select('pv.path', 'path')
        .addSelect('COUNT(*)', 'count')
        .groupBy('pv.path')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany(),
      this.repo.find({ order: { createdAt: 'DESC' }, take: 50 }),
    ]);

    return {
      totalViews,
      todayViews,
      topPages: topPages.map((p: { path: string; count: string }) => ({
        path: p.path,
        count: parseInt(p.count, 10),
      })),
      recentViews,
    };
  }
}
