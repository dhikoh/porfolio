import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ default: '' })
  location: string;

  @Column()
  startDate: string;

  @Column({ default: '' })
  endDate: string;

  @Column({ default: false })
  current: boolean;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '[]' })
  highlights: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
