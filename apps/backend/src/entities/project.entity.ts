import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

export enum ProjectStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', default: '' })
  longDesc: string;

  @Column({ default: '' })
  domain: string;

  @Column({ default: '' })
  liveUrl: string;

  @Column({ default: '' })
  githubUrl: string;

  @Column({ default: '' })
  imageUrl: string;

  @Column({ default: '' })
  videoUrl: string;

  @Column({ type: 'text', default: '[]' })
  tags: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PUBLISHED })
  status: ProjectStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
