import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseInterceptors, UploadedFiles,
  UseGuards, Request, ValidationPipe, ParseIntPipe,
  Logger,
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

  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async proposerParExpert(
    @Body(ValidationPipe) dto: CreateFormationDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    const imageFile = files?.find(f => f.fieldname === 'image');
    const expert = await this.expertRepo.findOne({
      where: { user_id: req.user.id },
      relations: ['user']
    });
    if (!expert || !expert.user) {
      throw new Error('Expert non trouvé');
    }
    return this.formationsService.createFromExpert(dto, imageFile, expert.id, expert.user);
  }

  @Get('expert/mes-formations')
  @UseGuards(JwtAuthGuard)
  async getMesFormations(@Request() req: RequestWithUser) {
    return this.formationsService.findByExpert(req.user.id);
  }

  @Post('admin/create')
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.logger.log(`📥 Corps reçu: ${JSON.stringify(body)}`);
    
    // Extraire et parser formateur_details
    let formateurDetailsArray = [];
    if (body.formateur_details) {
      try {
        formateurDetailsArray = JSON.parse(body.formateur_details);
        this.logger.log(`✅ formateur_details parsé: ${JSON.stringify(formateurDetailsArray)}`);
      } catch (e) {
        this.logger.error(`❌ Erreur parsing formateur_details: ${e.message}`);
      }
    }
    
    // Construire le DTO manuellement
    const dto = new CreateFormationDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.domaine = body.domaine;
    dto.formateur = body.formateur;
    dto.formateur_details = formateurDetailsArray;
    dto.type = body.type;
    dto.prix = body.prix ? parseInt(body.prix, 10) : undefined;
    dto.places_limitees = body.places_limitees === 'true';
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
    const formateurImages = files
      ?.filter(f => f.fieldname && f.fieldname.startsWith('formateur_image'))
      .sort((a, b) => {
        const idxA = parseInt(a.fieldname.split('_').pop() || '0', 10);
        const idxB = parseInt(b.fieldname.split('_').pop() || '0', 10);
        return idxA - idxB;
      }) || [];
    
    this.logger.log(`👥 Nombre de formateurs: ${formateurDetailsArray.length}`);
    this.logger.log(`👥 Images formateurs: ${formateurImages.length}`);
    
    return this.formationsService.create(dto, imageFile, formateurImages);
  }

  @Get('admin/all')
  async findAll() {
    const formations = await this.formationsService.findAll();
    // Log pour vérifier les données
    formations.forEach(f => {
      this.logger.log(`Formation ${f.id}: ${f.titre} - formateurs: ${JSON.stringify(f.formateur_details)}`);
    });
    return formations;
  }

  @Put('admin/:id')
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.logger.log(`📥 Mise à jour ${id} - Corps: ${JSON.stringify(body)}`);
    
    // Extraire et parser formateur_details
    let formateurDetailsArray = [];
    if (body.formateur_details) {
      try {
        formateurDetailsArray = JSON.parse(body.formateur_details);
        this.logger.log(`✅ formateur_details parsé: ${JSON.stringify(formateurDetailsArray)}`);
      } catch (e) {
        this.logger.error(`❌ Erreur parsing: ${e.message}`);
      }
    }
    
    // Construire le DTO
    const dto = new UpdateFormationDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.domaine = body.domaine;
    dto.formateur = body.formateur;
    dto.formateur_details = formateurDetailsArray;
    dto.type = body.type;
    dto.prix = body.prix ? parseInt(body.prix, 10) : undefined;
    dto.places_limitees = body.places_limitees === 'true';
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
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.formationsService.updateStatut(id, dto);
  }

  @Delete('admin/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.delete(id);
  }

  @Get('public')
  async findPublished() {
    return this.formationsService.findPublished();
  }

  @Get('public/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.findOne(id);
  }
}