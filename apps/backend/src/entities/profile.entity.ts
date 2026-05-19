import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  tagline: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  birthPlace: string;

  @Column({ default: '' })
  birthDate: string;

  @Column({ default: '' })
  instagram: string;

  @Column({ default: '' })
  linkedin: string;

  @Column({ default: '' })
  github: string;

  @Column({ default: '' })
  facebook: string;

  @Column({ default: '' })
  twitter: string;

  @Column({ default: '' })
  website: string;

  @Column({ default: '' })
  avatarUrl: string;

  @Column({ default: '' })
  resumeUrl: string;

  @Column()
  heroTitle: string;

  @Column({ type: 'text' })
  heroSubtitle: string;

  @Column({ default: 'Terbuka untuk kolaborasi' })
  availableText: string;

  @Column({ default: 'Mari Berkolaborasi' })
  ctaText: string;

  @Column({ default: '' })
  ctaEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
