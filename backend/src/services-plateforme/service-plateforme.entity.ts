import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('services_plateforme')
export class ServicePlateforme {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  prix?: string | number | null;

  @Column({ type: 'varchar', nullable: true })
  duree?: string | null;

  @Column({ type: 'varchar', nullable: true })
  localisation?: string | null;

  @Column({ type: 'boolean', default: false })
  en_ligne!: boolean;

  @Column({ type: 'varchar', nullable: true })
  lien_formation?: string | null;

  @Column({ type: 'varchar', nullable: true })
  nom_formateur?: string | null;

  @Column({ type: 'int', nullable: true })
  places_limitees?: number | null;

  @Column({ type: 'varchar', nullable: true })
  image?: string | null;

  @Column({ type: 'varchar', nullable: true })
  date_debut?: string | null;

  @Column({ type: 'varchar', nullable: true })
  date_fin?: string | null;

  @Column({ type: 'varchar', nullable: true })
  niveau?: string | null;

  @Column({ type: 'varchar', nullable: true })
  categorie?: string | null;

  @Column({ type: 'varchar', default: 'en_attente' })
  statut!: string;

  @Column({ type: 'int', nullable: true })
  propose_par?: number | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'propose_par' })
  proposant?: User | null;

  @Column({ type: 'boolean', default: false })
  propose_par_expert!: boolean;

  @Column({ type: 'text', nullable: true })
  commentaire_admin?: string | null;

  @Column({ type: 'boolean', default: false })
  gratuit!: boolean;

  @Column({ type: 'text', nullable: true })
  programme?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}