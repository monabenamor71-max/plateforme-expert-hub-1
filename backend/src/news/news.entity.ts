// news.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ length: 100, nullable: true })
  categorie!: string;

  @Column({ length: 255, nullable: true })
  image!: string;

  @Column({ length: 255, nullable: true })
  attachment!: string;   // ✅ AJOUTÉ

  @Column({ default: 'brouillon' })
  statut!: string;

  @Column({ default: false, name: 'newsletter_envoye' })
  newsletter_envoye!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}