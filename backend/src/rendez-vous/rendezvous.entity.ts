import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';  // ✅ chemin corrigé

@Entity('rendezvous')
export class Rendezvous {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  expert_id!: number;

  @Column()
  client_id!: number;

  @Column({ nullable: true })
  sujet?: string;

  @ManyToOne(() => Expert)
  @JoinColumn({ name: 'expert_id' })
  expert!: Expert;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @Column({ type: 'datetime' })
  date_rdv!: Date;

  @Column({ type: 'enum', enum: ['en_attente', 'confirme', 'annule'], default: 'en_attente' })
  statut!: string;

  @CreateDateColumn()
  created_at!: Date;
}