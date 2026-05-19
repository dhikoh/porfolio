import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MergedDocument } from '../../entities/merged-document.entity';
import { DocumentMergerService } from './document-merger.service';
import { DocumentMergerController } from './document-merger.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MergedDocument])],
  controllers: [DocumentMergerController],
  providers: [DocumentMergerService],
})
export class DocumentMergerModule {}
