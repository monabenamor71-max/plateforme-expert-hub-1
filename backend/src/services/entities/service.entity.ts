import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['consulting', 'audit', 'accompagnement', 'formation', 'podcast'],
  })
  type: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50, nullable: true })
  icone: string;

  @Column({ length: 20, nullable: true, default: '#F7B500' })
  couleur: string;

  @Column({ nullable: true })
  image: string;

  @Column({ length: 50, nullable: true })
  duree: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prix: number;

  @Column({ type: 'json', nullable: true })
  details: any;

  @Column({ default: true })
  actif: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}