// src/podcast/podcast.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PodcastService } from './podcast.service';
import { CreatePodcastDto, UpdatePodcastDto } from './dto/podcast.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from '../user/expert.entity';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

// Créer les dossiers s'ils n'existent pas
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir('./uploads/podcasts-audio');
ensureDir('./uploads/podcasts-images');

// Configuration du stockage
const podcastStorage = diskStorage({
  destination: (req, file, cb) => {
    let folder = './uploads/';
    if (file.fieldname === 'video_file') {
      folder += 'podcasts-audio';
    } else if (file.fieldname === 'image_file') {
      folder += 'podcasts-images';
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `podcast-${unique}${ext}`);
  },
});

@Controller('podcasts')
export class PodcastController {
  private readonly logger = new Logger(PodcastController.name);

  constructor(
    private readonly podcastService: PodcastService,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  // ==================== EXPERTS ====================
  
  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { 
        storage: podcastStorage, 
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async proposerParExpert(
    @Body() body: any,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: RequestWithUser,
  ) {
    this.logger.log('=== PROPOSER PODCAST ===');
    this.logger.log(`Body reçu: ${JSON.stringify(body)}`);
    this.logger.log(`video_file: ${files?.video_file?.[0] ? 'présent' : 'absent'}`);
    this.logger.log(`image_file: ${files?.image_file?.[0] ? 'présent' : 'absent'}`);
    
    // Debug détaillé des fichiers
    if (files?.video_file?.[0]) {
      this.logger.log(`✅ Fichier vidéo: ${files.video_file[0].originalname}, ${files.video_file[0].size} bytes`);
    }
    
    try {
      // Récupérer l'expert
      const expert = await this.expertRepo.findOne({
        where: { user_id: req.user.id },
        relations: ['user']
      });
      
      if (!expert || !expert.user) {
        throw new BadRequestException('Expert non trouvé');
      }
      
      // Vérifier les fichiers
      const videoFile = files?.video_file?.[0];
      const hasVideoUrl = body.video_url && body.video_url.trim() !== '';
      
      if (!videoFile && !hasVideoUrl) {
        throw new BadRequestException('Le fichier vidéo ou une URL externe (YouTube, Vimeo, etc.) est obligatoire');
      }
      
      // Créer le DTO
      const dto = new CreatePodcastDto();
      dto.titre = body.titre;
      dto.description = body.description || '';
      dto.auteur = body.auteur || `${expert.user.prenom} ${expert.user.nom}`;
      dto.domaine = body.domaine || '';
      dto.video_url = body.video_url;
      dto.statut = 'en_attente';
      
      const imageFile = files?.image_file?.[0];
      
      const result = await this.podcastService.createByExpert(
        dto,
        expert.id,
        expert.user,
        videoFile,
        imageFile
      );
      
      this.logger.log(`Podcast créé avec succès, ID: ${result.id}`);
      return { success: true, podcast: result };
      
    } catch (error) {
      this.logger.error(`Erreur: ${error.message}`);
      throw error;
    }
  }

  @Get('expert/mes-podcasts')
  @UseGuards(JwtAuthGuard)
  async getMesPodcasts(@Request() req: RequestWithUser) {
    this.logger.log(`Récupération podcasts pour expert ${req.user.id}`);
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) {
      throw new BadRequestException('Expert non trouvé');
    }
    return this.podcastService.findByExpert(expert.id);
  }

  @Put('expert/modifier/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async modifierParExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: RequestWithUser,
  ) {
    this.logger.log(`Modification podcast ${id} par expert`);
    
    const dto = new UpdatePodcastDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.auteur = body.auteur;
    dto.domaine = body.domaine;
    dto.video_url = body.video_url;
    
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) {
      throw new BadRequestException('Expert non trouvé');
    }
    
    const videoFile = files?.video_file?.[0];
    const imageFile = files?.image_file?.[0];
    
    return this.podcastService.updateByExpert(id, expert.id, dto, videoFile, imageFile);
  }

  @Delete('expert/supprimer/:id')
  @UseGuards(JwtAuthGuard)
  async supprimerParExpert(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    this.logger.log(`Suppression podcast ${id} par expert`);
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) {
      throw new BadRequestException('Expert non trouvé');
    }
    return this.podcastService.deleteByExpert(id, expert.id);
  }

  // ==================== PUBLIQUES ====================
  
  @Get('public')
  async findPublished() {
    return this.podcastService.findPublished();
  }

  @Get('public/:id')
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.findOne(id);
  }

  // ==================== ADMIN ====================
  
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    this.logger.log('Récupération de tous les podcasts (admin)');
    return this.podcastService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.findOne(id);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async createByAdmin(
    @Body() body: any,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    this.logger.log('Création podcast par admin');
    
    const dto = new CreatePodcastDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.auteur = body.auteur;
    dto.domaine = body.domaine;
    dto.video_url = body.video_url;
    dto.statut = body.statut || 'publie';
    
    const videoFile = files?.video_file?.[0];
    const imageFile = files?.image_file?.[0];
    
    if (!videoFile && !dto.video_url) {
      throw new BadRequestException('Veuillez fournir un fichier vidéo ou une URL');
    }
    
    return this.podcastService.create(dto, videoFile, imageFile);
  }

  @Put('admin/update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    this.logger.log(`Mise à jour podcast ${id} par admin`);
    
    const dto = new UpdatePodcastDto();
    dto.titre = body.titre;
    dto.description = body.description;
    dto.auteur = body.auteur;
    dto.domaine = body.domaine;
    dto.video_url = body.video_url;
    dto.statut = body.statut;
    
    const videoFile = files?.video_file?.[0];
    const imageFile = files?.image_file?.[0];
    
    return this.podcastService.update(id, dto, videoFile, imageFile);
  }

  @Patch('admin/statut/:id')
  @UseGuards(JwtAuthGuard)
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: 'en_attente' | 'publie' | 'refuse',
  ) {
    this.logger.log(`Mise à jour statut podcast ${id} -> ${statut}`);
    return this.podcastService.updateStatut(id, statut);
  }

  @Delete('admin/delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteByAdmin(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Suppression podcast ${id} par admin`);
    return this.podcastService.delete(id);
  }
}