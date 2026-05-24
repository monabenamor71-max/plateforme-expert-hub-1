import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: false })
  is_read!: boolean;

  @Column({ type: 'text', nullable: true })
  admin_reply?: string;

  @Column({ nullable: true })
  replied_at?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}