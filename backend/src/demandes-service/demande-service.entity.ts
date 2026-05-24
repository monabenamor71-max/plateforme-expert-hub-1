import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Formation } from '../formations/formation.entity';

@Entity('demandes_service')
export class DemandeService {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  service!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  objectif?: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  domaine?: string;

  @Column({ type: 'json', nullable: true, default: [] })
  experts_notifies!: number[];

  @Column({ type: 'json', nullable: true, default: [] })
  experts_acceptes!: number[];

  @Column({ nullable: true })
  formation_id?: number;
  @ManyToOne(() => Formation, { nullable: true })
  @JoinColumn({ name: 'formation_id' })
  formation?: Formation;

  @Column({ nullable: true })
  expert_assigne_id?: number;
  @ManyToOne(() => Expert, { nullable: true, eager: true })
  @JoinColumn({ name: 'expert_assigne_id' })
  expert_assigne?: Expert;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  devis_montant?: number;

  @Column({ type: 'enum', enum: ['en_attente', 'notifie_experts', 'devis_envoye', 'acceptee', 'refusee', 'en_cours', 'terminee'], default: 'en_attente' })
  statut!: string;

  @Column({ type: 'text', nullable: true })
  commentaire_admin?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}