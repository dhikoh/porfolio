import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLetter } from '../../entities/cover-letter.entity';
import { CoverLetterService } from './cover-letter.service';
import { CoverLetterController } from './cover-letter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CoverLetter])],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
})
export class CoverLetterModule {}
