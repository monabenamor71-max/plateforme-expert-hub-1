import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formation } from './formation.entity';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FormationsService {
  private readonly logger = new Logger(FormationsService.name);

  constructor(
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
    private mailService: MailService,
  ) {}

  // ⚠️ CORRIGÉ : Supprimé relations['expert', 'expert.user']
  private async findOneOrFail(id: number): Promise<Formation> {
    const formation = await this.formationRepo.findOne({ 
      where: { id }
    });
    if (!formation) throw new NotFoundException(`Formation ${id} non trouvée`);
    return formation;
  }

  // ==================== EXPERT ENDPOINTS ====================
  
  async createFromExpert(
    dto: CreateFormationDto,
    imageFile: Express.Multer.File | undefined,
    expertId: number,
    expertUser: any
  ): Promise<Formation> {
    const placesMax = dto.places_limitees ? (dto.places_max || 0) : undefined;
    
    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: dto.formateur,
      formateur_details: dto.formateur_details || [],
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees || false,
      places_max: placesMax,
      places_disponibles: dto.places_limitees ? placesMax : undefined,
      duree: dto.duree,
      mode: dto.mode || 'en_ligne',
      localisation: dto.localisation,
      certifiante: dto.certifiante || false,
      a_la_une: dto.a_la_une ?? false,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      lien_formation: dto.lien_formation,
      gratuit: dto.gratuit || false,
      niveau: dto.niveau,
      categorie: dto.categorie,
      statut: 'en_attente',
      expertId,
      image: imageFile?.filename || '',
    });

    const saved = await this.formationRepo.save(formation);
    this.logger.log(`✅ Formation créée par expert ${expertId} - Statut: en_attente`);
    return saved;
  }

  async findByExpert(expertId: number): Promise<Formation[]> {
    return this.formationRepo.find({ 
      where: { expertId }, 
      order: { createdAt: 'DESC' } 
    });
  }

  // ==================== ADMIN ENDPOINTS ====================

  async create(dto: CreateFormationDto, imageFile: Express.Multer.File | undefined, formateurImages: Express.Multer.File[] = []): Promise<Formation> {
    this.logger.log(`📝 Création formation - formateur_details reçu: ${JSON.stringify(dto.formateur_details)}`);
    
    let processedFormateurs: any[] = [];
    if (dto.formateur_details && Array.isArray(dto.formateur_details) && dto.formateur_details.length > 0) {
      processedFormateurs = dto.formateur_details.map((item, idx) => {
        const imageFileItem = formateurImages[idx];
        return {
          prenom: item.prenom || '',
          nom: item.nom || '',
          domaine: item.domaine || '',
          bio: item.bio || '',
          image: imageFileItem ? imageFileItem.filename : (item.image || ''),
        };
      });
    }
    
    const formateurConcatene = processedFormateurs
      .map((f: any) => `${f.prenom} ${f.nom}`.trim())
      .filter((n: string) => n)
      .join(', ');
    
    const placesMax = dto.places_limitees ? (dto.places_max || 0) : undefined;
    
    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: formateurConcatene || dto.formateur,
      formateur_details: processedFormateurs,
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees || false,
      places_max: placesMax,
      places_disponibles: dto.places_limitees ? placesMax : undefined,
      duree: dto.duree,
      mode: dto.mode || 'en_ligne',
      localisation: dto.localisation,
      certifiante: dto.certifiante || false,
      a_la_une: dto.a_la_une ?? false,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      lien_formation: dto.lien_formation,
      gratuit: dto.gratuit || false,
      niveau: dto.niveau,
      categorie: dto.categorie,
      statut: dto.statut || 'brouillon',
      image: imageFile?.filename || '',
    });

    const saved = await this.formationRepo.save(formation);
    this.logger.log(`✅ Formation sauvegardée ID ${saved.id}`);
    return saved;
  }

  // ⚠️ CORRIGÉ : Supprimé relations['expert', 'expert.user']
  async findAll(): Promise<Formation[]> {
    console.log("🔍 Recherche de toutes les formations");
    const result = await this.formationRepo.find({ 
      order: { createdAt: 'DESC' } 
    });
    console.log(`🔍 Trouvé: ${result.length} formations`);
    return result;
  }

  // ⚠️ CORRIGÉ : Supprimé relations['expert', 'expert.user']
  async findByStatut(statut: string): Promise<Formation[]> {
    console.log(`🔍 Recherche des formations avec statut: ${statut}`);
    const result = await this.formationRepo.find({
      where: { statut },
      order: { createdAt: 'DESC' }
    });
    console.log(`🔍 Trouvé: ${result.length} formations`);
    return result;
  }

  async findAllWithExperts(): Promise<Formation[]> {
    return this.formationRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async publierFormationExpert(id: number): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    formation.statut = 'publie';
    const saved = await this.formationRepo.save(formation);
    this.logger.log(`✅ Formation ${id} publiée par l'admin`);
    return saved;
  }

  async refuserFormationExpert(id: number, commentaire?: string): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    formation.statut = 'refuse';
    if (commentaire) formation.commentaire_admin = commentaire;
    const saved = await this.formationRepo.save(formation);
    this.logger.log(`❌ Formation ${id} refusée par l'admin`);
    return saved;
  }

  async update(id: number, dto: UpdateFormationDto, imageFile: Express.Multer.File | undefined): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    
    if (imageFile) formation.image = imageFile.filename;
    if (dto.titre !== undefined) formation.titre = dto.titre;
    if (dto.description !== undefined) formation.description = dto.description;
    if (dto.domaine !== undefined) formation.domaine = dto.domaine;
    
    if (dto.formateur_details && Array.isArray(dto.formateur_details)) {
      const processedFormateurs = dto.formateur_details.map((fd: any) => ({
        prenom: fd.prenom || '',
        nom: fd.nom || '',
        domaine: fd.domaine || '',
        bio: fd.bio || '',
        image: fd.image || '',
      }));
      
      formation.formateur_details = processedFormateurs;
      formation.formateur = processedFormateurs
        .map((f: any) => `${f.prenom} ${f.nom}`.trim())
        .filter((n: string) => n)
        .join(', ');
    }
    
    if (dto.type !== undefined) formation.type = dto.type;
    if (dto.prix !== undefined) formation.prix = dto.prix;
    if (dto.places_limitees !== undefined) formation.places_limitees = dto.places_limitees;
    if (dto.places_max !== undefined) formation.places_max = dto.places_max;
    if (dto.places_disponibles !== undefined) formation.places_disponibles = dto.places_disponibles;
    if (dto.duree !== undefined) formation.duree = dto.duree;
    if (dto.mode !== undefined) formation.mode = dto.mode;
    if (dto.localisation !== undefined) formation.localisation = dto.localisation;
    if (dto.certifiante !== undefined) formation.certifiante = dto.certifiante;
    if (dto.a_la_une !== undefined) formation.a_la_une = dto.a_la_une;
    if (dto.dateDebut !== undefined) formation.dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : undefined;
    if (dto.dateFin !== undefined) formation.dateFin = dto.dateFin ? new Date(dto.dateFin) : undefined;
    if (dto.lien_formation !== undefined) formation.lien_formation = dto.lien_formation;
    if (dto.gratuit !== undefined) formation.gratuit = dto.gratuit;
    if (dto.niveau !== undefined) formation.niveau = dto.niveau;
    if (dto.categorie !== undefined) formation.categorie = dto.categorie;
    if (dto.statut !== undefined) formation.statut = dto.statut;
    
    return this.formationRepo.save(formation);
  }

  async updateStatut(id: number, dto: UpdateStatutDto): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    formation.statut = dto.statut;
    if (dto.commentaire) formation.commentaire_admin = dto.commentaire;
    return this.formationRepo.save(formation);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const formation = await this.findOneOrFail(id);
    await this.formationRepo.remove(formation);
    return { success: true };
  }

  // ==================== GESTION DES PLACES ====================

  async decrementPlaces(formationId: number): Promise<{ success: boolean; placesRestantes: number; placesMax: number }> {
    const formation = await this.findOneOrFail(formationId);
    
    if (!formation.places_limitees) {
      return { success: true, placesRestantes: -1, placesMax: -1 };
    }
    
    const placesMax = formation.places_max ?? 0;
    const placesRestantesAvant = formation.places_disponibles ?? 0;
    
    if (placesRestantesAvant <= 0) {
      throw new BadRequestException(
        `❌ Places non disponibles. Cette formation est complète (${placesMax} place${placesMax > 1 ? 's' : ''} maximum).`
      );
    }
    
    const result = await this.formationRepo
      .createQueryBuilder()
      .update(Formation)
      .set({ places_disponibles: () => 'places_disponibles - 1' })
      .where('id = :id', { id: formationId })
      .andWhere('places_disponibles > 0')
      .execute();
    
    if (result.affected === 0) {
      throw new BadRequestException(
        `❌ Plus de places disponibles. Cette formation est complète (${placesMax} place${placesMax > 1 ? 's' : ''} maximum).`
      );
    }
    
    const formationMisAJour = await this.findOneOrFail(formationId);
    const placesRestantes = formationMisAJour.places_disponibles ?? 0;
    
    return { success: true, placesRestantes, placesMax };
  }

  async hasAvailablePlaces(formationId: number): Promise<boolean> {
    const formation = await this.findOneOrFail(formationId);
    if (!formation.places_limitees) return true;
    return (formation.places_disponibles ?? 0) > 0;
  }

  async getPlacesRestantes(formationId: number): Promise<{ placesRestantes: number; placesMax: number; isLimited: boolean }> {
    const formation = await this.findOneOrFail(formationId);
    return {
      placesRestantes: formation.places_disponibles ?? 0,
      placesMax: formation.places_max ?? 0,
      isLimited: formation.places_limitees ?? false
    };
  }

  async incrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOneOrFail(formationId);
    if (formation.places_limitees) {
      const placesMax = formation.places_max ?? 0;
      const placesActuelles = formation.places_disponibles ?? 0;
      if (placesActuelles < placesMax) {
        formation.places_disponibles = placesActuelles + 1;
        await this.formationRepo.save(formation);
      }
    }
  }

  async findPublished(): Promise<Formation[]> {
    return this.formationRepo.find({ 
      where: { statut: 'publie' }, 
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: number): Promise<Formation> {
    return this.findOneOrFail(id);
  }
}