import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: ['youtube', 'vimeo', 'upload', 'external'], default: 'youtube' })
  type!: string;

  @Column({ nullable: true })
  miniature?: string;

  @Column({ nullable: true })
  emission?: string;

  @Column({ type: 'date', nullable: true })
  date_publication?: Date | null;

  @Column({ type: 'enum', enum: ['interview', 'reportage', 'conference'], default: 'interview' })
  categorie!: string;

  @Column({ default: false })
  featured!: boolean;

  @Column({ type: 'enum', enum: ['brouillon', 'publie'], default: 'brouillon' })
  statut!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}