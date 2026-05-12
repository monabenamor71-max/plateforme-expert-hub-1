import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateHistoireDto {
  @IsString()
  @IsOptional()
  annee_creation?: string;

  @IsString()
  @IsOptional()
  description_hero?: string;

  @IsString()
  @IsOptional()
  description_vision?: string;

  @IsString()
  @IsOptional()
  vision_point1?: string;

  @IsString()
  @IsOptional()
  vision_point2?: string;

  @IsString()
  @IsOptional()
  vision_point3?: string;

  @IsString()
  @IsOptional()
  vision_point4?: string;

  @IsString()
  @IsOptional()
  citation?: string;

  @IsString()
  @IsOptional()
  citation_auteur?: string;

  @IsString()
  @IsOptional()
  citation_role?: string;

  @IsString()
  @IsOptional()
  mission_titre?: string;

  @IsString()
  @IsOptional()
  mission_desc?: string;

  @IsString()
  @IsOptional()
  timeline1_year?: string;

  @IsString()
  @IsOptional()
  timeline1_title?: string;

  @IsString()
  @IsOptional()
  timeline1_desc?: string;

  @IsString()
  @IsOptional()
  timeline2_year?: string;

  @IsString()
  @IsOptional()
  timeline2_title?: string;

  @IsString()
  @IsOptional()
  timeline2_desc?: string;

  @IsString()
  @IsOptional()
  timeline3_year?: string;

  @IsString()
  @IsOptional()
  timeline3_title?: string;

  @IsString()
  @IsOptional()
  timeline3_desc?: string;

  @IsString()
  @IsOptional()
  timeline4_year?: string;

  @IsString()
  @IsOptional()
  timeline4_title?: string;

  @IsString()
  @IsOptional()
  timeline4_desc?: string;

  @IsString()
  @IsOptional()
  timeline5_year?: string;

  @IsString()
  @IsOptional()
  timeline5_title?: string;

  @IsString()
  @IsOptional()
  timeline5_desc?: string;

  @IsString()
  @IsOptional()
  timeline6_year?: string;

  @IsString()
  @IsOptional()
  timeline6_title?: string;

  @IsString()
  @IsOptional()
  timeline6_desc?: string;

  @IsString()
  @IsOptional()
  valeur1_titre?: string;

  @IsString()
  @IsOptional()
  valeur1_desc?: string;

  @IsString()
  @IsOptional()
  valeur1_color?: string;

  @IsString()
  @IsOptional()
  valeur2_titre?: string;

  @IsString()
  @IsOptional()
  valeur2_desc?: string;

  @IsString()
  @IsOptional()
  valeur2_color?: string;

  @IsString()
  @IsOptional()
  valeur3_titre?: string;

  @IsString()
  @IsOptional()
  valeur3_desc?: string;

  @IsString()
  @IsOptional()
  valeur3_color?: string;

  @IsEmail()
  @IsOptional()
  contact_email?: string;

  @IsString()
  @IsOptional()
  contact_telephone?: string;

  @IsString()
  @IsOptional()
  contact_adresse?: string;
}