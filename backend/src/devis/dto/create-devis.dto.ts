import { IsInt, IsPositive, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDevisDto {
  @IsInt()
  @IsPositive()
  demande_id!: number;

  @IsInt()
  @IsPositive()
  montant!: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsString()
  @IsOptional()
  delai?: string;
}