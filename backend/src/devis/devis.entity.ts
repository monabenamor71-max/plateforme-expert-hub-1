import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { DemandeService } from '../demandes-service/demande-service.entity';
import { Expert } from '../user/expert.entity';

@Entity('devis')
export class Devis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'demande_id' })
  demande_id!: number;

  @ManyToOne(() => DemandeService, { eager: true })
  @JoinColumn({ name: 'demande_id' })
  demande!: DemandeService;

  @Column({ name: 'expert_id' })
  expert_id!: number;

  @ManyToOne(() => Expert, { eager: true })
  @JoinColumn({ name: 'expert_id' })
  expert!: Expert;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ nullable: true })
  delai?: string;

  @Column({ type: 'enum', enum: ['en_attente', 'accepte', 'refuse'], default: 'en_attente' })
  statut!: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;
}