import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('contact_config')
export class ContactConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  telephone!: string;

  @Column({ nullable: true })
  adresse!: string;

  @Column({ nullable: true })
  horaires!: string;

  @Column({ type: 'text', nullable: true })
  description_hero!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}