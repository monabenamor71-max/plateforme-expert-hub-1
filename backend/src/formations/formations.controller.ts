import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseInterceptors, UploadedFiles,
  UseGuards, Request, ValidationPipe, ParseIntPipe,
  Logger, BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FormationsService } from './formations.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from '../user/expert.entity';
import type { Request as ExpressRequest } from 'express';
import * as fs from 'fs';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('./uploads/formations');
ensureDir('./uploads/formateurs');
ensureDir('./uploads/temp');

const dynamicStorage = diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, './uploads/formations');
    } else if (file.fieldname && file.fieldname.startsWith('formateur_image')) {
      cb(null, './uploads/formateurs');
    } else {
      cb(null, './uploads/temp');
    }
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = file.fieldname === 'image' ? 'formation' : 'formateur';
    cb(null, `${prefix}-${unique}${extname(file.originalname)}`);
  },
});

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

@Controller('formations')
export class FormationsController {
  private readonly logger = new Logger(FormationsController.name);

  constructor(
    private readonly formationsService: FormationsService,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  // ==================== EXPERT ENDPOINTS ====================
  
  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async proposerParExpert(
    @Body(ValidationPipe) dto: CreateFormationDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    this.logger.log(`📝 Expert ${req.user.id} propose une formation: ${dto.titre}`);
    
    const imageFile = files?.find(f => f.fieldname === 'image');
    const expert = await this.expertRepo.findOne({
      where: { user_id: req.user.id },
      relations: ['user']
    });
    
    if (!expert || !expert.user) {
      throw new BadRequestException('Expert non trouvé');
    }
    
    const formation = await this.formationsService.createFromExpert(dto, imageFile, expert.id, expert.user);
    
    return {
      success: true,
      message: 'Formation proposée avec succès, en attente de validation par l\'administrateur',
      formation
    };
  }

  @Get('expert/mes-formations')
  @UseGuards(JwtAuthGuard)
  async getMesFormations(@Request() req: RequestWithUser) {
    return this.formationsService.findByExpert(req.user.id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post('admin/create')
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.logger.log(`📥 Admin création formation: ${JSON.stringify(body)}`);
    
    let formateurDetailsArray = [];
    if (body.formateur_details) {
      try {
        formateurDetailsArray = JSON.parse(body.formateur_details);
      } catch (e) {
        this.logger.error(`Erreur parsing formateur_details: ${e.message}`);
      }
    }
    
    const dto = new CreateFormationDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.domaine = body.domaine;
    dto.formateur = body.formateur;
    dto.formateur_details = formateurDetailsArray;
    dto.type = body.type;
    dto.prix = body.prix ? parseInt(body.prix, 10) : undefined;
    dto.places_limitees = body.places_limitees === 'true';
    dto.places_max = body.places_max ? parseInt(body.places_max, 10) : undefined;
    dto.places_disponibles = body.places_disponibles ? parseInt(body.places_disponibles, 10) : undefined;
    dto.duree = body.duree;
    dto.mode = body.mode;
    dto.localisation = body.localisation;
    dto.certifiante = body.certifiante === 'true';
    dto.a_la_une = body.a_la_une === 'true';
    dto.dateDebut = body.dateDebut;
    dto.dateFin = body.dateFin;
    dto.lien_formation = body.lien_formation;
    dto.gratuit = body.gratuit === 'true';
    dto.niveau = body.niveau;
    dto.categorie = body.categorie;
    dto.statut = body.statut || 'brouillon';
    
    const imageFile = files?.find(f => f.fieldname === 'image');
    const formateurImages = files
      ?.filter(f => f.fieldname && f.fieldname.startsWith('formateur_image'))
      .sort((a, b) => {
        const idxA = parseInt(a.fieldname.split('_').pop() || '0', 10);
        const idxB = parseInt(b.fieldname.split('_').pop() || '0', 10);
        return idxA - idxB;
      }) || [];
    
    return this.formationsService.create(dto, imageFile, formateurImages);
  }

  @Get('admin/all')
@UseGuards(JwtAuthGuard)
async findAll() {
  console.log("🔍 Appel à formations/admin/all");
  const formations = await this.formationsService.findAll();
  console.log(`🔍 ${formations.length} formations trouvées`);
  return formations;
}

  // ⚠️ ENDPOINT IMPORTANT - Récupère les formations en attente
  @Get('admin/en-attente')
  @UseGuards(JwtAuthGuard)
  async getFormationsEnAttente() {
    this.logger.log('📋 Admin: Récupération des formations en attente');
    const formations = await this.formationsService.findByStatut('en_attente');
    this.logger.log(`📋 ${formations.length} formation(s) en attente trouvée(s)`);
    return formations;
  }

  @Get('admin/all-with-experts')
  @UseGuards(JwtAuthGuard)
  async findAllWithExperts() {
    return this.formationsService.findAllWithExperts();
  }

  // ⚠️ ENDPOINT IMPORTANT - Publier une formation d'expert
  @Patch('admin/:id/publier')
  @UseGuards(JwtAuthGuard)
  async publierFormationExpert(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`📋 Admin: Publication de la formation ${id}`);
    const formation = await this.formationsService.publierFormationExpert(id);
    return { 
      success: true, 
      message: 'Formation publiée avec succès', 
      formation 
    };
  }

  // ⚠️ ENDPOINT IMPORTANT - Refuser une formation d'expert
  @Patch('admin/:id/refuser')
  @UseGuards(JwtAuthGuard)
  async refuserFormationExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { commentaire?: string }
  ) {
    this.logger.log(`📋 Admin: Refus de la formation ${id}`);
    const formation = await this.formationsService.refuserFormationExpert(id, body.commentaire);
    return { 
      success: true, 
      message: 'Formation refusée', 
      formation 
    };
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.findOne(id);
  }

  @Put('admin/:id')
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.logger.log(`📝 Admin: Mise à jour formation ${id}`);
    
    let formateurDetailsArray = [];
    if (body.formateur_details) {
      try {
        formateurDetailsArray = JSON.parse(body.formateur_details);
      } catch (e) {}
    }
    
    const dto = new UpdateFormationDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.domaine = body.domaine;
    dto.formateur = body.formateur;
    dto.formateur_details = formateurDetailsArray;
    dto.type = body.type;
    dto.prix = body.prix ? parseInt(body.prix, 10) : undefined;
    dto.places_limitees = body.places_limitees === 'true';
    dto.places_max = body.places_max ? parseInt(body.places_max, 10) : undefined;
    dto.places_disponibles = body.places_disponibles ? parseInt(body.places_disponibles, 10) : undefined;
    dto.duree = body.duree;
    dto.mode = body.mode;
    dto.localisation = body.localisation;
    dto.certifiante = body.certifiante === 'true';
    dto.a_la_une = body.a_la_une === 'true';
    dto.dateDebut = body.dateDebut;
    dto.dateFin = body.dateFin;
    dto.lien_formation = body.lien_formation;
    dto.gratuit = body.gratuit === 'true';
    dto.niveau = body.niveau;
    dto.categorie = body.categorie;
    dto.statut = body.statut;
    
    const imageFile = files?.find(f => f.fieldname === 'image');
    return this.formationsService.update(id, dto, imageFile);
  }

  @Patch('admin/:id/statut')
  @UseGuards(JwtAuthGuard)
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    this.logger.log(`📋 Admin: Mise à jour statut formation ${id} -> ${dto.statut}`);
    return this.formationsService.updateStatut(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`🗑️ Admin: Suppression formation ${id}`);
    return this.formationsService.delete(id);
  }

  // ==================== INSCRIPTION ENDPOINTS ====================

  @Post(':formationId/inscrire')
  @UseGuards(JwtAuthGuard)
  async inscrire(
    @Param('formationId', ParseIntPipe) formationId: number,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    this.logger.log(`📝 Tentative d'inscription à la formation ${formationId} par l'utilisateur ${userId}`);
    
    try {
      const hasPlaces = await this.formationsService.hasAvailablePlaces(formationId);
      
      if (!hasPlaces) {
        const placesInfo = await this.formationsService.getPlacesRestantes(formationId);
        throw new BadRequestException({
          success: false,
          message: `❌ Places non disponibles. Cette formation est complète (${placesInfo.placesMax} place${placesInfo.placesMax > 1 ? 's' : ''} maximum).`,
          code: 'FORMATION_COMPLETE'
        });
      }
      
      const result = await this.formationsService.decrementPlaces(formationId);
      
      this.logger.log(`✅ Inscription réussie pour formation ${formationId}`);
      
      return {
        success: true,
        message: `Inscription confirmée ! Il reste ${result.placesRestantes} place${result.placesRestantes > 1 ? 's' : ''} sur ${result.placesMax}.`,
        placesRestantes: result.placesRestantes,
        placesMax: result.placesMax
      };
      
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`❌ Erreur lors de l'inscription: ${error.message}`);
      throw new BadRequestException({
        success: false,
        message: error.message || 'Erreur lors de l\'inscription',
        code: 'INSCRIPTION_ERROR'
      });
    }
  }
  

  @Get(':formationId/places')
  async getPlacesDisponibles(@Param('formationId', ParseIntPipe) formationId: number) {
    return this.formationsService.getPlacesRestantes(formationId);
  }

  @Delete(':formationId/annuler')
  @UseGuards(JwtAuthGuard)
  async annulerInscription(
    @Param('formationId', ParseIntPipe) formationId: number,
    @Request() req: RequestWithUser,
  ) {
    this.logger.log(`📝 Annulation inscription formation ${formationId}`);
    await this.formationsService.incrementPlaces(formationId);
    return { success: true, message: 'Inscription annulée avec succès' };
  }

  // ==================== PUBLIC ENDPOINTS ====================

  @Get('public')
  async findPublished() {
    this.logger.log('📋 Public: Récupération des formations publiées');
    const formations = await this.formationsService.findPublished();
    this.logger.log(`📋 ${formations.length} formation(s) publiée(s) trouvée(s)`);
    return formations;
  }

  @Get('public/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.findOne(id);
  }
}