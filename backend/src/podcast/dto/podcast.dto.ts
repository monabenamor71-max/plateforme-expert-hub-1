// src/podcast/dto/podcast.dto.ts
import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreatePodcastDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  titre!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  auteur?: string;

  @IsString()
  @IsOptional()
  domaine?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  url_audio?: string;

  @IsIn(['en_attente', 'publie', 'refuse'])
  @IsOptional()
  statut?: 'en_attente' | 'publie' | 'refuse';
}

export class UpdatePodcastDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  titre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  auteur?: string;

  @IsString()
  @IsOptional()
  domaine?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  url_audio?: string;

  @IsIn(['en_attente', 'publie', 'refuse'])
  @IsOptional()
  statut?: 'en_attente' | 'publie' | 'refuse';
}