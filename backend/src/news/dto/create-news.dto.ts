export class CreateNewsDto {
  titre!: string;
  description?: string;
  categorie?: string;
  image?: string;
  statut?: string;
  newsletter_envoye?: boolean;
}

export class UpdateNewsDto {
  titre?: string;
  description?: string;
  categorie?: string;
  image?: string;
  statut?: string;
  newsletter_envoye?: boolean;
}