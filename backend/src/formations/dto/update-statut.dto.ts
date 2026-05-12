import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['brouillon', 'publie', 'archive', 'en_attente'])
  statut!: string;

  @IsString()
  @IsOptional()
  commentaire?: string;
}