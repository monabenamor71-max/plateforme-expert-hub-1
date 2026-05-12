import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('startups')
export class Startup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  user_id!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ nullable: true })
  nom_startup?: string;

  @Column({ nullable: true })
  secteur?: string;

  @Column({ nullable: true })
  taille?: string;

  @Column({ nullable: true })
  site_web?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  fonction?: string;

  @Column({ nullable: true })
  localisation?: string;

  @Column({ default: 'en_attente' })
  statut: string = 'en_attente';

  @Column({ nullable: true })
  photo?: string;

  // ✅ CORRECTION : Utiliser les noms exacts des colonnes dans la base
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}