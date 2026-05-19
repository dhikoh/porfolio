import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column()
  value: string;

  @Column({ default: '' })
  icon: string;

  @Column({ default: 0 })
  sortOrder: number;
}
