// src/startups/dto/update-startup.dto.ts
import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

export class UpdateStartupDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  nom_startup?: string;

  @IsString()
  @IsOptional()
  secteur?: string;

  @IsString()
  @IsOptional()
  taille?: string;

  @IsUrl()
  @IsOptional()
  site_web?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fonction?: string;

  @IsString()
  @IsOptional()
  localisation?: string;
}