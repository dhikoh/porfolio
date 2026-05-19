import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timeline } from '../../entities/timeline.entity';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
@Module({ imports: [TypeOrmModule.forFeature([Timeline])], controllers: [TimelineController], providers: [TimelineService] })
export class TimelineModule {}
