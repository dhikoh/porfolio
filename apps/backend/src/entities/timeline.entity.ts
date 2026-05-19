import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('timelines')
export class Timeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;
}
