import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stat } from '../../entities/stat.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
@Module({ imports: [TypeOrmModule.forFeature([Stat])], controllers: [StatsController], providers: [StatsService] })
export class StatsModule {}
