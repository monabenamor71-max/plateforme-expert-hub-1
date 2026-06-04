import { IsString, IsOptional, IsBoolean, IsInt, Min, IsDateString, IsEnum, IsUrl, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class FormateurDetailDto {
  @Transform(({ value }) => (value === null || value === undefined ? '' : String(value)))
  @IsString()
  @IsOptional()
  prenom?: string;

  @Transform(({ value }) => (value === null || value === undefined ? '' : String(value)))
  @IsString()
  @IsOptional()
  nom?: string;

  @Transform(({ value }) => (value === null || value === undefined ? '' : String(value)))
  @IsString()
  @IsOptional()
  domaine?: string;

  @Transform(({ value }) => (value === null || value === undefined ? '' : String(value)))
  @IsString()
  @IsOptional()
  image?: string;

  @Transform(({ value }) => (value === null || value === undefined ? '' : String(value)))
  @IsString()
  @IsOptional()
  bio?: string;
}

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

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            prenom: item?.prenom ?? '',
            nom: item?.nom ?? '',
            domaine: item?.domaine ?? '',
            bio: item?.bio ?? '',
            image: item?.image ?? '',
          }));
        }
        return [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return value.map(item => ({
        prenom: item?.prenom ?? '',
        nom: item?.nom ?? '',
        domaine: item?.domaine ?? '',
        bio: item?.bio ?? '',
        image: item?.image ?? '',
      }));
    }
    return [];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormateurDetailDto)
  @IsOptional()
  formateur_details?: FormateurDetailDto[];

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
  @Min(1)
  @IsOptional()
  places_max?: number;

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

  @IsEnum(['en_ligne', 'presentiel', 'hybride'])
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