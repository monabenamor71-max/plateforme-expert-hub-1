import { IsEnum } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['en_attente', 'accepte', 'refuse'])
  statut!: string;
}