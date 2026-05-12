import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  user_id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  domaine?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cv?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  portfolio?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  experience?: string;

  @Column({ type: 'int', nullable: true })
  annee_debut_experience?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  localisation?: string;

  @Column({ type: 'enum', enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' })
  statut: string = 'en_attente';

  @Column({ default: false })
  modification_demandee!: boolean;

  @Column({ type: 'text', nullable: true })
  modifications_en_attente?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}