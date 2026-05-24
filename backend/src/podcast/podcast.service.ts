// src/podcast/podcast.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Podcast } from './podcast.entity';
import { CreatePodcastDto, UpdatePodcastDto } from './dto/podcast.dto';
import { MailService } from '../mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PodcastService {
  private readonly logger = new Logger(PodcastService.name);

  constructor(
    @InjectRepository(Podcast)
    private podcastRepo: Repository<Podcast>,
    private mailService: MailService,
  ) {
    this.logger.log('PodcastService initialisé');
  }

  private async ensurePodcastExists(id: number): Promise<Podcast> {
    const podcast = await this.podcastRepo.findOne({ where: { id } });
    if (!podcast) throw new NotFoundException(`Podcast ${id} introuvable`);
    return podcast;
  }

  // ==================== ADMIN ====================
  async findAll(): Promise<Podcast[]> {
    return this.podcastRepo.find({ order: { date_creation: 'DESC' } });
  }

  async findOne(id: number): Promise<Podcast> {
    return this.ensurePodcastExists(id);
  }

  async create(
    dto: CreatePodcastDto,
    videoFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    this.logger.log(`create - videoFile: ${!!videoFile}, video_url: ${dto.video_url}`);
    
    const hasVideoFile = !!videoFile;
    const hasVideoUrl = dto.video_url && dto.video_url.trim() !== '';
    
    if (!hasVideoFile && !hasVideoUrl) {
      throw new BadRequestException('Le fichier vidéo ou une URL externe est obligatoire');
    }
    
    const podcast = this.podcastRepo.create({
      titre: dto.titre,
      description: dto.description || '',
      auteur: dto.auteur || '',
      domaine: dto.domaine || '',
      statut: dto.statut || 'en_attente',
      url_audio: videoFile ? videoFile.filename : (dto.video_url || dto.url_audio || ''),
      image: imageFile?.filename || '',
    });
    
    const saved = await this.podcastRepo.save(podcast);
    this.logger.log(`Podcast créé (admin) : ${saved.id}`);
    return saved;
  }

  async update(
    id: number,
    dto: UpdatePodcastDto,
    videoFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = await this.ensurePodcastExists(id);

    if (videoFile) {
      if (podcast.url_audio && !podcast.url_audio.startsWith('http')) {
        const oldPath = path.join(process.cwd(), 'uploads', 'podcasts-audio', podcast.url_audio);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      podcast.url_audio = videoFile.filename;
    }
    
    if (dto.video_url !== undefined && !videoFile) {
      podcast.url_audio = dto.video_url;
    }
    
    if (dto.url_audio !== undefined && !videoFile) {
      podcast.url_audio = dto.url_audio;
    }
    
    if (imageFile) {
      if (podcast.image) {
        const oldPath = path.join(process.cwd(), 'uploads', 'podcasts-images', podcast.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      podcast.image = imageFile.filename;
    }

    if (dto.titre !== undefined) podcast.titre = dto.titre;
    if (dto.description !== undefined) podcast.description = dto.description;
    if (dto.auteur !== undefined) podcast.auteur = dto.auteur;
    if (dto.domaine !== undefined) podcast.domaine = dto.domaine;
    if (dto.statut !== undefined) podcast.statut = dto.statut;

    const updated = await this.podcastRepo.save(podcast);
    this.logger.log(`Podcast ${id} mis à jour`);
    return updated;
  }

  async updateStatut(id: number, statut: 'en_attente' | 'publie' | 'refuse'): Promise<Podcast> {
    const podcast = await this.ensurePodcastExists(id);
    podcast.statut = statut;
    const updated = await this.podcastRepo.save(podcast);
    this.logger.log(`Podcast ${id} : statut changé à ${statut}`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const podcast = await this.ensurePodcastExists(id);
    if (podcast.url_audio && !podcast.url_audio.startsWith('http')) {
      const audioPath = path.join(process.cwd(), 'uploads', 'podcasts-audio', podcast.url_audio);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
    if (podcast.image) {
      const imagePath = path.join(process.cwd(), 'uploads', 'podcasts-images', podcast.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await this.podcastRepo.remove(podcast);
    this.logger.log(`Podcast ${id} supprimé`);
  }

  // ==================== EXPERTS ====================
  async createByExpert(
    dto: CreatePodcastDto,
    expertId: number,
    expertUser: any,
    videoFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    this.logger.log(`=== createByExpert ===`);
    this.logger.log(`Expert ID: ${expertId}`);
    this.logger.log(`Titre: ${dto.titre}`);
    this.logger.log(`videoFile: ${videoFile ? videoFile.originalname : 'non fourni'}`);
    this.logger.log(`imageFile: ${imageFile ? imageFile.originalname : 'non fourni'}`);
    
    const hasVideoFile = !!videoFile;
    const hasVideoUrl = dto.video_url && dto.video_url.trim() !== '';
    
    this.logger.log(`hasVideoFile: ${hasVideoFile}, hasVideoUrl: ${hasVideoUrl}`);
    
    if (!hasVideoFile && !hasVideoUrl) {
      throw new BadRequestException('Le fichier vidéo ou une URL externe (YouTube, Vimeo, etc.) est obligatoire');
    }
    
    try {
      const podcastData: Partial<Podcast> = {
        titre: dto.titre,
        description: dto.description || '',
        auteur: dto.auteur || `${expertUser.prenom} ${expertUser.nom}`,
        domaine: dto.domaine || '',
        statut: 'en_attente',
        expert_id: expertId,
      };
      
      if (videoFile) {
        podcastData.url_audio = videoFile.filename;
        this.logger.log(`Fichier vidéo sauvegardé: ${videoFile.filename}`);
      } else if (dto.video_url) {
        podcastData.url_audio = dto.video_url;
        this.logger.log(`URL vidéo sauvegardée: ${dto.video_url}`);
      }
      
      if (imageFile) {
        podcastData.image = imageFile.filename;
        this.logger.log(`Image sauvegardée: ${imageFile.filename}`);
      }
      
      const podcast = this.podcastRepo.create(podcastData);
      const saved = await this.podcastRepo.save(podcast);
      
      this.logger.log(`Podcast créé avec succès par expert ${expertId} : ${saved.id}`);
      
      // Envoi d'email (non bloquant)
      try {
        if (this.mailService && expertUser?.email) {
          await this.mailService.sendPodcastProposeeNotification(
            expertUser.prenom || 'Expert',
            expertUser.nom || '',
            expertUser.email,
            dto.titre || 'Sans titre',
            dto.domaine || 'Non spécifié',
            dto.description || ''
          );
          this.logger.log(`Email envoyé à ${expertUser.email}`);
        }
      } catch (emailError) {
        this.logger.error(`Erreur envoi email (non bloquante): ${emailError.message}`);
      }
      
      return saved;
    } catch (error) {
      this.logger.error(`Erreur dans createByExpert: ${error.message}`);
      this.logger.error(error.stack);
      throw new InternalServerErrorException(`Erreur lors de la création du podcast: ${error.message}`);
    }
  }

  async findByExpert(expertId: number): Promise<Podcast[]> {
    this.logger.log(`Recherche podcasts pour expert ${expertId}`);
    const podcasts = await this.podcastRepo.find({
      where: { expert_id: expertId },
      order: { date_creation: 'DESC' },
    });
    this.logger.log(`Trouvé ${podcasts.length} podcast(s)`);
    return podcasts;
  }

  async updateByExpert(
    podcastId: number,
    expertId: number,
    dto: UpdatePodcastDto,
    videoFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = await this.ensurePodcastExists(podcastId);
    if (podcast.expert_id !== expertId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce podcast');
    }
    const { statut, ...allowedDto } = dto;
    return this.update(podcastId, allowedDto, videoFile, imageFile);
  }

  async deleteByExpert(podcastId: number, expertId: number): Promise<void> {
    const podcast = await this.ensurePodcastExists(podcastId);
    if (podcast.expert_id !== expertId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce podcast');
    }
    return this.delete(podcastId);
  }

  // ==================== PUBLIQUES ====================
  async findPublished(): Promise<Podcast[]> {
    return this.podcastRepo.find({
      where: { statut: 'publie' },
      order: { date_creation: 'DESC' },
    });
  }
}