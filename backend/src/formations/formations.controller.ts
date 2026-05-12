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

// Création automatique des dossiers
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('./uploads/formations');
ensureDir('./uploads/formateurs');
ensureDir('./uploads/temp');

// Storage dynamique : choix du dossier selon le nom du champ
const dynamicStorage = diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, './uploads/formations');
    } else if (file.fieldname.startsWith('formateur_image')) {
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
  ) {
    this.logger.log('✅ FormationsController initialisé');
  }

  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async proposerParExpert(
    @Body(ValidationPipe) dto: CreateFormationDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    this.logger.log(`🔵 Requête proposition formation - User ID: ${req.user.id}`);
    
    const imageFile = files.find(f => f.fieldname === 'image');
    
    // Récupérer les informations de l'expert pour l'email
    const expert = await this.expertRepo.findOne({ 
      where: { user_id: req.user.id },
      relations: ['user']
    });
    
    this.logger.log(`🔵 Expert trouvé: ${expert ? 'OUI' : 'NON'}`);
    
    if (!expert || !expert.user) {
      this.logger.error(`❌ Expert ou user non trouvé pour l'utilisateur ${req.user.id}`);
      throw new Error('Expert non trouvé');
    }
    
    this.logger.log(`🔵 Expert: ${expert.user.prenom} ${expert.user.nom} (${expert.user.email})`);
    this.logger.log(`🔵 Formation: ${dto.titre}`);
    
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
    @Body(ValidationPipe) dto: CreateFormationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageFile = files.find(f => f.fieldname === 'image');
    const formateurImages = files
      .filter(f => f.fieldname.startsWith('formateur_image'))
      .sort((a, b) => {
        const idxA = parseInt(a.fieldname.split('_').pop() || '0', 10);
        const idxB = parseInt(b.fieldname.split('_').pop() || '0', 10);
        return idxA - idxB;
      });
    return this.formationsService.create(dto, imageFile, formateurImages);
  }

  @Get('admin/all')
  async findAll() {
    return this.formationsService.findAll();
  }

  @Put('admin/:id')
  @UseInterceptors(AnyFilesInterceptor({ storage: dynamicStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateFormationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageFile = files.find(f => f.fieldname === 'image');
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