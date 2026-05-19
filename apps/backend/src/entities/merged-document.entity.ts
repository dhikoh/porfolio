import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('merged_documents')
export class MergedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  sourceFiles: string; // JSON array of original filenames

  @Column()
  outputPath: string;

  @Column({ default: 0 })
  fileSize: number;

  @Column({ default: 0 })
  pageCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
