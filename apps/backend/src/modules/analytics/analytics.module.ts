import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageView } from '../../entities/page-view.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
@Module({ imports: [TypeOrmModule.forFeature([PageView])], controllers: [AnalyticsController], providers: [AnalyticsService] })
export class AnalyticsModule {}
