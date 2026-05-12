// src/formations/formations.service.ts
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
  ) {
    this.logger.log('✅ FormationsService initialisé');
  }

  private async findOneOrFail(id: number): Promise<Formation> {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException(`Formation ${id} non trouvée`);
    return formation;
  }

  // ==================== EXPERTS ====================
  async createFromExpert(
    dto: CreateFormationDto, 
    imageFile: Express.Multer.File | undefined, 
    expertId: number,
    expertUser: any
  ): Promise<Formation> {
    this.logger.log(`📝 Création formation par expert ${expertId}`);
    this.logger.log(`👤 Expert: ${expertUser?.prenom} ${expertUser?.nom} (${expertUser?.email})`);
    this.logger.log(`📚 Formation: ${dto.titre}`);

    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: dto.formateur,
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees || false,
      places_disponibles: dto.places_limitees ? (dto.places_disponibles || 0) : undefined,
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
    this.logger.log(`✅ Formation sauvegardée ID: ${saved.id}`);

    // 🔔 ENVOYER NOTIFICATION EMAIL À L'ADMIN
    try {
      if (this.mailService && expertUser && expertUser.email) {
        this.logger.log(`📧 Envoi email pour formation ${saved.id}...`);
        await this.mailService.sendFormationProposeeNotification(
          expertUser.prenom || 'Expert',
          expertUser.nom || '',
          expertUser.email || '',
          dto.titre || 'Sans titre',
          dto.domaine || 'Non spécifié',
          dto.description || ''
        );
        this.logger.log(`✅ Email admin envoyé pour formation ${saved.id}`);
      } else {
        this.logger.warn(`⚠️ Impossible d'envoyer l'email: mailService=${!!this.mailService}, expertUser=${!!expertUser}, email=${expertUser?.email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email: ${error.message}`);
    }
    
    return saved;
  }

  async findByExpert(expertId: number): Promise<Formation[]> {
    return this.formationRepo.find({ where: { expertId }, order: { createdAt: 'DESC' } });
  }

  // ==================== ADMIN ====================
  async create(dto: CreateFormationDto, imageFile: Express.Multer.File | undefined, formateurImages: Express.Multer.File[] = []): Promise<Formation> {
    let formateurDetails: Array<any> = [];

    if (dto.formateur_details && Array.isArray(dto.formateur_details)) {
      formateurDetails = dto.formateur_details.map((item, idx) => {
        const imageFileItem = formateurImages[idx];
        return {
          prenom: item.prenom || '',
          nom: item.nom || '',
          domaine: item.domaine || '',
          image: imageFileItem ? imageFileItem.filename : (item.image || ''),
          bio: item.bio || '',
        };
      });
    } else if (dto.formateur && dto.formateur.trim()) {
      formateurDetails = [{
        prenom: '',
        nom: dto.formateur.trim(),
        domaine: dto.domaine || '',
        image: formateurImages[0]?.filename || '',
        bio: '',
      }];
    }

    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: dto.formateur,
      formateur_details: formateurDetails,
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees || false,
      places_disponibles: dto.places_limitees ? (dto.places_disponibles || 0) : undefined,
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

    return this.formationRepo.save(formation);
  }

  async findAll(): Promise<Formation[]> {
    return this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, dto: UpdateFormationDto, imageFile: Express.Multer.File | undefined): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    if (imageFile) formation.image = imageFile.filename;
    if (dto.titre !== undefined) formation.titre = dto.titre;
    if (dto.description !== undefined) formation.description = dto.description;
    if (dto.domaine !== undefined) formation.domaine = dto.domaine;
    if (dto.formateur !== undefined) formation.formateur = dto.formateur;
    if (dto.formateur_details && Array.isArray(dto.formateur_details)) {
      formation.formateur_details = dto.formateur_details;
    }
    if (dto.type !== undefined) formation.type = dto.type;
    if (dto.prix !== undefined) formation.prix = dto.prix;
    if (dto.places_limitees !== undefined) formation.places_limitees = dto.places_limitees;
    if (dto.places_disponibles !== undefined) formation.places_disponibles = dto.places_disponibles;
    if (dto.duree !== undefined) formation.duree = dto.duree;
    if (dto.mode !== undefined) formation.mode = dto.mode;
    if (dto.localisation !== undefined) formation.localisation = dto.localisation;
    if (dto.certifiante !== undefined) formation.certifiante = dto.certifiante;
    if (dto.a_la_une !== undefined) formation.a_la_une = dto.a_la_une;
    if (dto.dateDebut !== undefined) formation.dateDebut = new Date(dto.dateDebut);
    if (dto.dateFin !== undefined) formation.dateFin = new Date(dto.dateFin);
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

  async decrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOneOrFail(formationId);
    if (formation.places_limitees) {
      const places = formation.places_disponibles ?? 0;
      if (places <= 0) throw new BadRequestException('Plus de places disponibles');
      formation.places_disponibles = places - 1;
      await this.formationRepo.save(formation);
    }
  }

  async incrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOneOrFail(formationId);
    if (formation.places_limitees) {
      formation.places_disponibles = (formation.places_disponibles ?? 0) + 1;
      await this.formationRepo.save(formation);
    }
  }

  // ==================== PUBLIQUES ====================
  async findPublished(): Promise<Formation[]> {
    return this.formationRepo.find({ where: { statut: 'publie' }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Formation> {
    return this.findOneOrFail(id);
  }
}