// src/news/dto/create-news.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  titre!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsBoolean()
  newsletter_envoye?: boolean;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsBoolean()
  newsletter_envoye?: boolean;
}