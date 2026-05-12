import { IsEnum } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['brouillon', 'publié', 'archive'])
  statut!: string;
}