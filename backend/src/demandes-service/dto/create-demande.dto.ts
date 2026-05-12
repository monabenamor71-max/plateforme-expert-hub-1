import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDemandeDto {
  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  @IsOptional()
  delai?: string;

  @IsString()
  @IsOptional()
  objectif?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  type_application?: string;

  @IsString()
  @IsOptional()
  domaine?: string;
}