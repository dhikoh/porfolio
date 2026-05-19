import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('page_views')
export class PageView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column({ default: '' })
  userAgent: string;

  @Column({ default: '' })
  referrer: string;

  @Column({ default: '' })
  ip: string;

  @CreateDateColumn()
  createdAt: Date;
}
