import { IsNumber, IsString, IsOptional, Min, IsPositive } from 'class-validator';

export class SoumettreDevisDto {
  @IsNumber()
  @IsPositive()
  @Min(0)
  montant!: number;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  delai?: string;
}