import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum([
    'en_attente',
    'notifie_experts',   // ← AJOUTER
    'devis_envoye',      // ← AJOUTER
    'acceptee',
    'refusee',
    'en_cours',
    'terminee'
  ])
  statut!: string;

  @IsString()
  @IsOptional()
  commentaire?: string;
}