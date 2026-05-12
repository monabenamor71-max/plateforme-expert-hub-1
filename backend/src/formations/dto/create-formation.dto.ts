import { IsString, IsOptional, IsBoolean, IsInt, Min, IsDateString, IsEnum, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFormationDto {
  @IsString()
  titre!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  domaine?: string;

  @IsString()
  @IsOptional()
  formateur?: string;

  // Pas de validation stricte, on va parser manuellement dans le service
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return Array.isArray(value) ? value : [];
  })
  formateur_details?: any[];

  // ... tous les autres champs (prix, places_limitees, etc.) avec les transformations existantes
  @IsEnum(['gratuit', 'payant'])
  @IsOptional()
  type?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  prix?: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  @IsOptional()
  places_limitees?: boolean;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  places_disponibles?: number;

  @IsString()
  @IsOptional()
  duree?: string;

  @IsEnum(['en_ligne', 'presentiel'])
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  @IsOptional()
  certifiante?: boolean;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  @IsOptional()
  a_la_une?: boolean;

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl()
  lien_formation?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  @IsOptional()
  gratuit?: boolean;

  @IsString()
  @IsOptional()
  niveau?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsEnum(['brouillon', 'publie', 'archive', 'en_attente'])
  @IsOptional()
  statut?: string;
}