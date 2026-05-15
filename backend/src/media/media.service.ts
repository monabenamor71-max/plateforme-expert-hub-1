import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}

  async create(
    createDto: CreateMediaDto,
    miniatureFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Media> {
    const mediaData: Partial<Media> = {
      titre: createDto.titre,
      description: createDto.description,
      url: videoFile?.filename || createDto.url,
      type: createDto.type || 'youtube',
      miniature: miniatureFile?.filename || createDto.miniature,
      emission: createDto.emission,
      date_publication: createDto.date_publication ? new Date(createDto.date_publication) : null,
      categorie: createDto.categorie || 'interview',
      featured: createDto.featured || false,
      statut: createDto.statut || 'brouillon',
    };
    const media = this.mediaRepo.create(mediaData);
    const saved = await this.mediaRepo.save(media);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création du média');
    }
    this.logger.log(`Média créé : ${saved.id} - ${saved.titre}`);
    return saved;
  }

  async findAllAdmin(): Promise<Media[]> {
    return this.mediaRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException(`Média ${id} non trouvé`);
    return media;
  }

  async update(
    id: number,
    updateDto: UpdateMediaDto,
    miniatureFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Media> {
    const media = await this.findOne(id);
    if (miniatureFile) updateDto.miniature = miniatureFile.filename;
    if (videoFile) updateDto.url = videoFile.filename;
    if (updateDto.date_publication) updateDto.date_publication = new Date(updateDto.date_publication) as any;
    Object.assign(media, updateDto);
    const updated = await this.mediaRepo.save(media);
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour du média');
    }
    this.logger.log(`Média mis à jour : ${id}`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const media = await this.findOne(id);
    // Supprimer le fichier vidéo si c'est un upload local (pas une URL externe)
    if (media.url && !media.url.startsWith('http')) {
      const videoFullPath = path.join(process.cwd(), 'uploads', 'videos', media.url);
      if (fs.existsSync(videoFullPath)) {
        fs.unlinkSync(videoFullPath);
        this.logger.log(`Fichier vidéo supprimé : ${media.url}`);
      }
    }
    // Supprimer la miniature
    if (media.miniature) {
      const miniFullPath = path.join(process.cwd(), 'uploads', 'videos-miniatures', media.miniature);
      if (fs.existsSync(miniFullPath)) {
        fs.unlinkSync(miniFullPath);
        this.logger.log(`Miniature supprimée : ${media.miniature}`);
      }
    }
    const removed = await this.mediaRepo.remove(media);
    if (!removed) {
      throw new BadRequestException('Erreur lors de la suppression du média');
    }
    this.logger.log(`Média supprimé : ${id}`);
  }

  async findPublished(featuredOnly = false): Promise<Media[]> {
    const query = this.mediaRepo
      .createQueryBuilder('media')
      .where('media.statut = :statut', { statut: 'publie' })
      .orderBy('media.createdAt', 'DESC');
    if (featuredOnly) query.andWhere('media.featured = :featured', { featured: true });
    return query.getMany();
  }

  async findOnePublic(id: number): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id, statut: 'publie' } });
    if (!media) throw new NotFoundException('Média non trouvé ou non publié');
    return media;
  }
}