export class CreateServiceDto {
  type: string;
  nom: string;
  slug: string;
  description: string;
  icone?: string;
  couleur?: string;
  image?: string;
  duree?: string;
  prix?: number;
  details?: any;
  actif?: boolean;
}