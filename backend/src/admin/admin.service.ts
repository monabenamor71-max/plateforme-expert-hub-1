// src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { Blog } from '../blog/blog.entity';
import { MailService } from '../mail/mail.service';
import { MediaService } from '../media/media.service';
import { PodcastService } from '../podcast/podcast.service';
import { CreatePodcastDto, UpdatePodcastDto } from '../podcast/dto/podcast.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private mailService: MailService,
    private mediaService: MediaService,
    private podcastService: PodcastService,
    private dataSource: DataSource,
  ) {}

  // ==================== USERS ====================
  getAllUsers() {
    return this.userRepo.find();
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    const deleteResult = await this.userRepo.delete(id);
    if (deleteResult.affected === 0) {
      throw new BadRequestException('Impossible de supprimer l’utilisateur');
    }
    return { message: 'Utilisateur supprimé' };
  }

  async toggleUserStatut(id: number, statut: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    const updateResult = await this.userRepo.update(id, { statut });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour le statut');
    }
    return { message: 'Statut mis à jour' };
  }

  // ==================== EXPERTS ====================
  getAllExperts() {
    return this.expertRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  getExpertEnAttente() {
    return this.expertRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  async getExpertsModifications() {
    return this.expertRepo.find({ where: { modification_demandee: true }, relations: ['user'] });
  }

  async validerModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    if (!expert.modifications_en_attente) throw new NotFoundException('Aucune modification en attente');

    let modifications: any;
    try {
      modifications = JSON.parse(expert.modifications_en_attente);
    } catch {
      throw new BadRequestException('Format des modifications invalide');
    }

    if (modifications.domaine !== undefined) expert.domaine = modifications.domaine;
    if (modifications.description !== undefined) expert.description = modifications.description;
    if (modifications.localisation !== undefined) expert.localisation = modifications.localisation;
    if (modifications.experience !== undefined) expert.experience = modifications.experience;
    if (modifications.annee_debut_experience !== undefined) expert.annee_debut_experience = modifications.annee_debut_experience;
    if (modifications.telephone) {
      const userUpdate = await this.userRepo.update(expert.user_id, { telephone: modifications.telephone });
      if (userUpdate.affected === 0) {
        throw new BadRequestException('Impossible de mettre à jour le téléphone');
      }
    }

    expert.modification_demandee = false;
    expert.modifications_en_attente = '';
    const saved = await this.expertRepo.save(expert);
    if (!saved) {
      throw new BadRequestException('Erreur lors de la sauvegarde des modifications');
    }
    return { message: 'Modifications validées et appliquées' };
  }

  async refuserModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    expert.modification_demandee = false;
    expert.modifications_en_attente = '';
    const saved = await this.expertRepo.save(expert);
    if (!saved) {
      throw new BadRequestException('Erreur lors du refus des modifications');
    }
    return { message: 'Modifications refusées' };
  }

  async validerExpert(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expert = await queryRunner.manager.findOne(Expert, { where: { id }, relations: ['user'] });
      if (!expert) throw new NotFoundException('Expert non trouvé');

      if (!expert.user) {
        throw new BadRequestException('Utilisateur associé à l\'expert introuvable');
      }

      expert.statut = 'valide';
      const savedExpert = await queryRunner.manager.save(expert);
      if (!savedExpert) throw new BadRequestException('Erreur lors de la validation de l’expert');

      const userUpdate = await queryRunner.manager.update(User, expert.user_id, { statut: 'actif' });
      if (userUpdate.affected === 0) throw new BadRequestException('Impossible de mettre à jour l’utilisateur');

      await this.mailService.sendValidationEmail(
        expert.user.nom || '',
        expert.user.email || ''
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Expert ${id} validé avec succès`);
      return { message: 'Expert validé' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors de la validation de l'expert ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors de la validation');
    } finally {
      await queryRunner.release();
    }
  }

  async refuserExpert(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expert = await queryRunner.manager.findOne(Expert, { where: { id }, relations: ['user'] });
      if (!expert) throw new NotFoundException('Expert non trouvé');

      if (!expert.user) {
        throw new BadRequestException('Utilisateur associé à l\'expert introuvable');
      }

      expert.statut = 'refuse';
      const savedExpert = await queryRunner.manager.save(expert);
      if (!savedExpert) throw new BadRequestException('Erreur lors du refus de l’expert');

      const userUpdate = await queryRunner.manager.update(User, expert.user_id, { statut: 'inactif' });
      if (userUpdate.affected === 0) throw new BadRequestException('Impossible de mettre à jour l’utilisateur');

      await this.mailService.sendRefusEmail(
        expert.user.nom || '',
        expert.user.email || ''
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Expert ${id} refusé`);
      return { message: 'Expert refusé' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors du refus de l'expert ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors du refus');
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== STARTUPS ====================
  getAllStartups() {
    return this.startupRepo.find({ relations: ['user'] });
  }

  getStartupEnAttente() {
    return this.startupRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  async validerStartup(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const startup = await queryRunner.manager.findOne(Startup, { where: { id }, relations: ['user'] });
      if (!startup) throw new NotFoundException('Startup non trouvée');

      if (!startup.user) {
        throw new BadRequestException('Utilisateur associé à la startup introuvable');
      }

      startup.statut = 'valide';
      const savedStartup = await queryRunner.manager.save(startup);
      if (!savedStartup) throw new BadRequestException('Erreur lors de la validation de la startup');

      const userUpdate = await queryRunner.manager.update(User, startup.user_id, { statut: 'actif' });
      if (userUpdate.affected === 0) throw new BadRequestException('Impossible de mettre à jour l’utilisateur');

      await this.mailService.sendValidationEmail(
        startup.user.nom || '',
        startup.user.email || ''
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Startup ${id} validée`);
      return { message: 'Startup validée' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors de la validation de la startup ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors de la validation');
    } finally {
      await queryRunner.release();
    }
  }

  async refuserStartup(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const startup = await queryRunner.manager.findOne(Startup, { where: { id }, relations: ['user'] });
      if (!startup) throw new NotFoundException('Startup non trouvée');

      if (!startup.user) {
        throw new BadRequestException('Utilisateur associé à la startup introuvable');
      }

      startup.statut = 'refuse';
      const savedStartup = await queryRunner.manager.save(startup);
      if (!savedStartup) throw new BadRequestException('Erreur lors du refus de la startup');

      const userUpdate = await queryRunner.manager.update(User, startup.user_id, { statut: 'inactif' });
      if (userUpdate.affected === 0) throw new BadRequestException('Impossible de mettre à jour l’utilisateur');

      await this.mailService.sendRefusEmail(
        startup.user.nom || '',
        startup.user.email || ''
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Startup ${id} refusée`);
      return { message: 'Startup refusée' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors du refus de la startup ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors du refus');
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== VALIDATION ADMIN POUR NOUVEAUX COMPTES ====================

  async validateUserByAdmin(userId: number) {
    this.logger.log(`Admin validation pour user ${userId}`);
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    if (user.statut !== 'en_attente_approbation') {
      throw new BadRequestException(`L'utilisateur est en statut ${user.statut}, ne peut pas être validé`);
    }
    
    user.statut = 'actif';
    await this.userRepo.save(user);
    this.logger.log(`✅ User ${userId} activé par admin`);
    
    await this.mailService.sendAccountActivatedEmail(user.email, `${user.prenom} ${user.nom}`);
    
    return { message: 'Compte activé avec succès', user: { id: user.id, email: user.email, statut: user.statut } };
  }

  async rejectUserByAdmin(userId: number) {
    this.logger.log(`Admin rejection pour user ${userId}`);
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    if (user.statut !== 'en_attente_approbation') {
      throw new BadRequestException(`L'utilisateur est en statut ${user.statut}, ne peut pas être refusé`);
    }
    
    user.statut = 'refuse';
    await this.userRepo.save(user);
    this.logger.log(`❌ User ${userId} refusé par admin`);
    
    await this.mailService.sendAccountRejectedEmail(user.email, `${user.prenom} ${user.nom}`);
    
    return { message: 'Compte refusé', user: { id: user.id, email: user.email, statut: user.statut } };
  }

  async getPendingUsers() {
    const users = await this.userRepo.find({
      where: { statut: 'en_attente_approbation' },
      relations: ['expert', 'startup'],
    });
    
    const result: any[] = [];
    
    for (const user of users) {
      if (user.role === 'expert' && user.expert) {
        result.push({
          id: user.id,
          email: user.email,
          prenom: user.prenom,
          nom: user.nom,
          role: user.role,
          domaine: user.expert.domaine,
          localisation: user.expert.localisation,
          createdAt: user.createdAt,
        });
      } else if (user.role === 'startup' && user.startup) {
        result.push({
          id: user.id,
          email: user.email,
          prenom: user.prenom,
          nom: user.nom,
          role: user.role,
          nom_startup: user.startup.nom_startup,
          secteur: user.startup.secteur,
          createdAt: user.createdAt,
        });
      }
    }
    
    return result;
  }

  // ==================== STATS ====================
  async getStats() {
    const experts = await this.expertRepo.count();
    const startups = await this.startupRepo.count();
    return { experts, startups };
  }

  // ==================== BLOG ====================
  async getAllArticlesAdmin() {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findArticleById(id: number) {
    const article = await this.blogRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article non trouvé');
    return article;
  }

  async createArticle(data: any, imageFile: any, pdfFile: any) {
    const article = this.blogRepo.create({
      titre: data.titre,
      description: data.description,
      contenu: data.contenu,
      type: data.type || 'article',
      categorie: data.categorie,
      duree_lecture: data.duree_lecture,
      statut: data.statut || 'brouillon',
      image: imageFile?.filename || null,
      pdf: pdfFile?.filename || null,
    });
    const saved = await this.blogRepo.save(article);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création de l’article');
    }
    return saved;
  }

  async updateArticle(id: number, data: any, imageFile: any, pdfFile: any) {
    const article = await this.findArticleById(id);
    if (imageFile) data.image = imageFile.filename;
    if (pdfFile) data.pdf = pdfFile.filename;
    Object.assign(article, data);
    const saved = await this.blogRepo.save(article);
    if (!saved) {
      throw new BadRequestException('Erreur lors de la mise à jour de l’article');
    }
    return saved;
  }

  async updateArticleStatut(id: number, statut: string) {
    const article = await this.findArticleById(id);
    article.statut = statut;
    const saved = await this.blogRepo.save(article);
    if (!saved) {
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
    return saved;
  }

  async deleteArticle(id: number) {
    const article = await this.findArticleById(id);
    const removed = await this.blogRepo.remove(article);
    if (!removed) {
      throw new BadRequestException('Erreur lors de la suppression de l’article');
    }
    return removed;
  }

  // ==================== MÉDIAS ====================
  async getAllMediasAdmin() {
    return this.mediaService.findAllAdmin();
  }

  async getMediaById(id: number) {
    return this.mediaService.findOne(id);
  }

  async createMedia(data: any, miniatureFile: Express.Multer.File) {
    return this.mediaService.create(data, miniatureFile);
  }

  async updateMedia(id: number, data: any, miniatureFile: Express.Multer.File) {
    return this.mediaService.update(id, data, miniatureFile);
  }

  async deleteMedia(id: number) {
    return this.mediaService.delete(id);
  }

  // ==================== PODCASTS ====================
  async getAllPodcastsAdmin() {
    return this.podcastService.findAll();
  }

  async getPodcastById(id: number) {
    return this.podcastService.findOne(id);
  }

  async createPodcast(dto: CreatePodcastDto, audioFile?: Express.Multer.File, imageFile?: Express.Multer.File) {
    return this.podcastService.create(dto, audioFile, imageFile);
  }

  async updatePodcast(id: number, dto: UpdatePodcastDto, audioFile?: Express.Multer.File, imageFile?: Express.Multer.File) {
    return this.podcastService.update(id, dto, audioFile, imageFile);
  }

  async updatePodcastStatut(id: number, statut: 'en_attente' | 'publie' | 'refuse') {
    return this.podcastService.updateStatut(id, statut);
  }

  async deletePodcast(id: number) {
    return this.podcastService.delete(id);
  }
}