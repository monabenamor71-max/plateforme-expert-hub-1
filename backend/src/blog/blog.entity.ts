import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog')
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titre!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'longtext', nullable: true })
  contenu!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ nullable: true })
  pdf!: string;

  @Column({ default: 'article' })
  type!: string;

  @Column({ nullable: true })
  categorie!: string;

  @Column({ nullable: true })
  duree_lecture!: string;

  @Column({ default: 'brouillon' })
  statut!: string;

  @Column({ default: 0 })
  vues!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}