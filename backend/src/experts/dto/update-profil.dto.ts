import { IsString, IsOptional } from 'class-validator';

export class UpdateProfilDto {
  @IsString()
  @IsOptional()
  domaine?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  // ✅ Plus aucune validation (ni entier, ni plage)
  @IsOptional()
  annee_debut_experience?: number;
}