import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, MaxLength, Matches, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterStartupDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @MinLength(6, { message: 'Mot de passe trop court (min 6 caractères)' })
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/, { message: 'Le prénom ne peut contenir que des lettres, espaces, tirets ou apostrophes' })
  prenom!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/, { message: 'Le nom ne peut contenir que des lettres, espaces, tirets ou apostrophes' })
  nom!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[\+]?[\d\s\-\(\)]{7,20}$/, { message: 'Téléphone invalide' })
  telephone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nom_startup!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  secteur?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fonction?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  taille?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  site_web?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  localisation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}