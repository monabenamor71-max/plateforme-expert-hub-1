import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("formations")
export class Formation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titre!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  domaine?: string;

  // Pour la rétrocompatibilité (un seul formateur texte)
  @Column({ nullable: true })
  formateur?: string;

  // ✅ Nouvelle structure JSON pour plusieurs formateurs
  @Column({ type: "json", nullable: true })
  formateur_details?: Array<{
    prenom: string;
    nom: string;
    domaine: string;
    image: string;
    bio: string;   // texte libre, peut contenir des puces (lignes séparées par \n)
  }>;

  @Column({ default: "payant" })
  type!: string;

  @Column({ type: "int", nullable: true })
  prix?: number;

  @Column({ default: false })
  places_limitees!: boolean;

  @Column({ nullable: true })
  places_disponibles?: number;

  @Column({ nullable: true })
  duree?: string;

  @Column({ default: "en_ligne" })
  mode!: string;

  @Column({ nullable: true })
  localisation?: string;

  @Column({ default: false })
  certifiante!: boolean;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: "brouillon" })
  statut!: string;

  @Column({ default: false })
  a_la_une!: boolean;

  @Column({ type: "date", nullable: true })
  dateDebut?: Date;

  @Column({ type: "date", nullable: true })
  dateFin?: Date;

  @Column({ nullable: true })
  expertId?: number;

  @Column({ nullable: true })
  lien_formation?: string;

  @Column({ default: false })
  gratuit!: boolean;

  @Column({ nullable: true })
  niveau?: string;

  @Column({ nullable: true })
  categorie?: string;

  @Column({ type: "text", nullable: true })
  commentaire_admin?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}