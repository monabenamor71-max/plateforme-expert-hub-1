// src/blog/dto/update-statut.dto.ts
import { IsEnum } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['brouillon', 'publié', 'archive', 'publie', 'en_attente'])
  statut!: string;
}