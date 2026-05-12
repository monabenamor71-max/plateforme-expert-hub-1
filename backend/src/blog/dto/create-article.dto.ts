// src/blog/dto/create-article.dto.ts
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titre!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contenu?: string;

  @IsEnum(['article', 'conseil'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsString()
  @IsOptional()
  duree_lecture?: string;

  // ✅ Accepte 'publié' (avec accent) et 'publie' (sans accent)
  @IsEnum(['brouillon', 'publié', 'archive', 'publie', 'en_attente'])
  @IsOptional()
  statut?: string;

  @IsString()
  @IsOptional()
  image?: string;
}