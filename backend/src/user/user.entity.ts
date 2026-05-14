// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Expert } from './expert.entity';
import { Startup } from './startup.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ type: 'enum', enum: ['admin', 'expert', 'startup'], default: 'startup' })
  role: string = 'startup';

  @Column({ 
    type: 'enum', 
    enum: ['en_attente_verification', 'en_attente_approbation', 'actif', 'refuse', 'inactif'],
    default: 'en_attente_verification'
  })
  statut: string = 'en_attente_verification';

  @Column({ nullable: true })
  photo?: string;

  @Column({ default: false })
  email_verified!: boolean;

  @Column({ nullable: true })
  reset_code?: string;

  @Column({ nullable: true, type: 'datetime' })
  reset_code_expires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // ✅ Relation avec Expert (peut être undefined)
  @OneToOne(() => Expert, expert => expert.user)
  expert?: Expert;

  // ✅ Relation avec Startup (peut être undefined)
  @OneToOne(() => Startup, startup => startup.user)
  startup?: Startup;
}