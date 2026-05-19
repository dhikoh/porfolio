import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'id' })
  language: string; // 'id' | 'en'

  @Column()
  position: string;

  @Column()
  companyName: string;

  @Column({ type: 'text' })
  formData: string; // JSON stringified full form data

  @Column({ default: '' })
  signatureUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
