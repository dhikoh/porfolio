import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('process_steps')
export class ProcessStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;
}
