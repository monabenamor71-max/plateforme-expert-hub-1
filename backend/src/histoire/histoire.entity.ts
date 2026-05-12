import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";

@Entity("histoire")
export class Histoire {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "2019" })
  annee_creation!: string;

  @Column({ type: "text", nullable: true })
  description_hero?: string;

  @Column({ type: "text", nullable: true })
  description_vision?: string;

  @Column({ type: "text", nullable: true })
  vision_point1?: string;

  @Column({ type: "text", nullable: true })
  vision_point2?: string;

  @Column({ type: "text", nullable: true })
  vision_point3?: string;

  @Column({ type: "text", nullable: true })
  vision_point4?: string;

  @Column({ type: "text", nullable: true })
  citation?: string;

  @Column({ nullable: true })
  citation_auteur?: string;

  @Column({ nullable: true })
  citation_role?: string;

  @Column({ type: "text", nullable: true })
  mission_titre?: string;

  @Column({ type: "text", nullable: true })
  mission_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline1_year?: string;

  @Column({ type: "text", nullable: true })
  timeline1_title?: string;

  @Column({ type: "text", nullable: true })
  timeline1_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline2_year?: string;

  @Column({ type: "text", nullable: true })
  timeline2_title?: string;

  @Column({ type: "text", nullable: true })
  timeline2_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline3_year?: string;

  @Column({ type: "text", nullable: true })
  timeline3_title?: string;

  @Column({ type: "text", nullable: true })
  timeline3_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline4_year?: string;

  @Column({ type: "text", nullable: true })
  timeline4_title?: string;

  @Column({ type: "text", nullable: true })
  timeline4_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline5_year?: string;

  @Column({ type: "text", nullable: true })
  timeline5_title?: string;

  @Column({ type: "text", nullable: true })
  timeline5_desc?: string;

  @Column({ type: "text", nullable: true })
  timeline6_year?: string;

  @Column({ type: "text", nullable: true })
  timeline6_title?: string;

  @Column({ type: "text", nullable: true })
  timeline6_desc?: string;

  @Column({ type: "text", nullable: true })
  valeur1_titre?: string;

  @Column({ type: "text", nullable: true })
  valeur1_desc?: string;

  @Column({ nullable: true })
  valeur1_color?: string;

  @Column({ type: "text", nullable: true })
  valeur2_titre?: string;

  @Column({ type: "text", nullable: true })
  valeur2_desc?: string;

  @Column({ nullable: true })
  valeur2_color?: string;

  @Column({ type: "text", nullable: true })
  valeur3_titre?: string;

  @Column({ type: "text", nullable: true })
  valeur3_desc?: string;

  @Column({ nullable: true })
  valeur3_color?: string;

  @Column({ nullable: true })
  contact_email?: string;

  @Column({ nullable: true })
  contact_telephone?: string;

  @Column({ nullable: true })
  contact_adresse?: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}