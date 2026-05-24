import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('demandes')
export class Demande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  service_id: number;

  @Column({ nullable: true })
  expert_id: number;

  @Column({
    type: 'enum',
    enum: ['en_attente', 'accepte', 'refuse', 'en_cours', 'termine'],
    default: 'en_attente'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  reponse_admin: string;

  @Column({ type: 'date', nullable: true })
  date_souhaitee: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}