import { IsEnum } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['accepte', 'refuse', 'en_attente'])
  statut: string;
}