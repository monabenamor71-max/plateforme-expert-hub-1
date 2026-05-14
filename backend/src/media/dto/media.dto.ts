// src/media/dto/media.dto.ts
import { IsOptional, IsString, IsEnum, IsBoolean, IsUrl, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMediaDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  videoPath?: string;               // ✅ AJOUT : reçu par l'upload

  @IsOptional()
  @IsEnum(['youtube', 'vimeo', 'upload', 'external'])
  type?: string;

  @IsOptional()
  @IsString()
  miniature?: string;

  @IsOptional()
  @IsString()
  emission?: string;

  @IsOptional()
  @IsDateString()
  date_publication?: string;

  @IsOptional()
  @IsEnum(['interview', 'reportage', 'conference'])
  categorie?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(['brouillon', 'publie'])
  statut?: string;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}