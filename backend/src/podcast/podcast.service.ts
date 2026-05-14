import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
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
  ) {}

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
    // ✅ Vérification : soit un fichier vidéo, soit une URL externe
    if (!videoFile && !dto.url_audio) {
      throw new BadRequestException('Le fichier vidéo ou une URL externe (YouTube, Vimeo, etc.) est obligatoire');
    }
    
    const podcast = this.podcastRepo.create({
      titre: dto.titre,
      description: dto.description || '',
      auteur: dto.auteur || '',
      domaine: dto.domaine || '',
      statut: dto.statut || 'en_attente',
      // ✅ Si fichier uploadé, on prend le nom; sinon, on prend l'URL fournie
      url_audio: videoFile ? videoFile.filename : dto.url_audio,
      image: imageFile?.filename || '',
    });
    
    const saved = await this.podcastRepo.save(podcast);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création du podcast');
    }
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
    
    // ✅ Si une URL est fournie dans le DTO (mise à jour)
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
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour du podcast');
    }
    this.logger.log(`Podcast ${id} mis à jour`);
    return updated;
  }

  async updateStatut(id: number, statut: 'en_attente' | 'publie' | 'refuse'): Promise<Podcast> {
    const podcast = await this.ensurePodcastExists(id);
    podcast.statut = statut;
    const updated = await this.podcastRepo.save(podcast);
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
    this.logger.log(`Podcast ${id} : statut changé à ${statut}`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const podcast = await this.ensurePodcastExists(id);
    // ✅ Ne supprimer le fichier que si c'est un fichier local (pas une URL externe)
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
    // ✅ Vérification : soit un fichier vidéo, soit une URL externe
    if (!videoFile && !dto.url_audio) {
      throw new BadRequestException('Le fichier vidéo ou une URL externe (YouTube, Vimeo, etc.) est obligatoire');
    }
    
    const podcast = this.podcastRepo.create({
      titre: dto.titre,
      description: dto.description || '',
      auteur: dto.auteur || '',
      domaine: dto.domaine || '',
      statut: 'en_attente',
      url_audio: videoFile ? videoFile.filename : dto.url_audio,
      image: imageFile?.filename || '',
      expert_id: expertId,
    });
    
    const saved = await this.podcastRepo.save(podcast);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création du podcast par l’expert');
    }
    
    try {
      if (this.mailService && expertUser) {
        await this.mailService.sendPodcastProposeeNotification(
          expertUser.prenom || 'Expert',
          expertUser.nom || '',
          expertUser.email || '',
          dto.titre || 'Sans titre',
          dto.domaine || 'Non spécifié',
          dto.description || ''
        );
        this.logger.log(`📧 Notification admin envoyée pour le podcast: ${saved.id}`);
      }
    } catch (emailError) {
      this.logger.error(`❌ Erreur envoi email admin pour podcast: ${emailError.message}`);
    }
    
    this.logger.log(`Podcast créé par expert ${expertId} : ${saved.id}`);
    return saved;
  }

  async findByExpert(expertId: number): Promise<Podcast[]> {
    return this.podcastRepo.find({
      where: { expert_id: expertId },
      order: { date_creation: 'DESC' },
    });
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