// src/podcast/podcast.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Expert } from '../user/expert.entity';

@Entity('podcasts')
export class Podcast {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, length: 500 })
  url_audio?: string;

  @Column({ nullable: true, length: 255 })
  image?: string;

  @Column({ nullable: true, length: 255 })
  auteur?: string;

  @Column({ nullable: true, length: 255 })
  domaine?: string;

  @Column({ type: 'varchar', default: 'en_attente', length: 50 })
  statut: string = 'en_attente';

  @Column({ name: 'expert_id', nullable: true })
  expert_id?: number;

  @ManyToOne(() => Expert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert?: Expert;

  @CreateDateColumn({ name: 'date_creation' })
  date_creation!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}