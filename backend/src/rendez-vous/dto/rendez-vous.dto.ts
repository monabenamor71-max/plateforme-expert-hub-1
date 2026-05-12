import { IsInt, IsDateString, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateRendezVousDto {
  @IsInt()
  @IsNotEmpty()
  expert_id!: number;

  @IsDateString()
  @IsNotEmpty()
  date_rdv!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  sujet!: string;
}

export class UpdateRendezVousDto {
  @IsDateString()
  @IsNotEmpty()
  date_rdv!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  sujet?: string;
}

export class AccepterPropositionDto {
  @IsDateString()
  @IsNotEmpty()
  nouvelle_date!: string;
}