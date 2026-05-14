// src/media/media.entity.ts
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

  @Column({ nullable: true })
  url?: string;                     // optionnel (pour les liens externes)

  @Column({ nullable: true })
  videoPath?: string;               // ✅ AJOUT : chemin du fichier vidéo uploadé

  @Column({ type: 'enum', enum: ['youtube', 'vimeo', 'upload', 'external'], default: 'youtube' })
  type!: string;                    // 'upload' pour un fichier local

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