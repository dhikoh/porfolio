import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Entities
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Project } from './entities/project.entity';
import { Skill } from './entities/skill.entity';
import { Experience } from './entities/experience.entity';
import { Education } from './entities/education.entity';
import { Timeline } from './entities/timeline.entity';
import { Stat } from './entities/stat.entity';
import { ProcessStep } from './entities/process-step.entity';
import { Media } from './entities/media.entity';
import { Message } from './entities/message.entity';
import { PageView } from './entities/page-view.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { AuditLog } from './entities/audit-log.entity';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SkillsModule } from './modules/skills/skills.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { EducationModule } from './modules/education/education.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { StatsModule } from './modules/stats/stats.module';
import { ProcessStepsModule } from './modules/process-steps/process-steps.module';
import { MediaModule } from './modules/media/media.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { ExportModule } from './modules/export/export.module';
import { LoggerModule } from './common/services/logger.module';
import { AuditModule } from './common/services/audit.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        database: config.get<string>('DATABASE_NAME', 'portfolio'),
        username: config.get<string>('DATABASE_USER', 'portfolio'),
        password: config.get<string>('DATABASE_PASSWORD', ''),
        entities: [
          User, Profile, Project, Skill, Experience, Education,
          Timeline, Stat, ProcessStep, Media, Message, PageView,
          SiteSetting, AuditLog,
        ],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 60000, limit: 100 },
      ],
    }),

    // Logger & Audit
    LoggerModule,
    AuditModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProfileModule,
    ProjectsModule,
    SkillsModule,
    ExperiencesModule,
    EducationModule,
    TimelineModule,
    StatsModule,
    ProcessStepsModule,
    MediaModule,
    MessagesModule,
    AnalyticsModule,
    SettingsModule,
    HealthModule,
    ExportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
