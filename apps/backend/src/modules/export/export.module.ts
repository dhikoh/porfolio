import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { Profile } from '../../entities/profile.entity';
import { Experience } from '../../entities/experience.entity';
import { Education } from '../../entities/education.entity';
import { Skill } from '../../entities/skill.entity';
import { Project } from '../../entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Experience, Education, Skill, Project])],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
