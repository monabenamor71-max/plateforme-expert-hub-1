import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sender_id!: number;

  @Column()
  receiver_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;

  @Column({ type: 'text' })
  contenu!: string;

  @Column({ default: false })
  lu!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}