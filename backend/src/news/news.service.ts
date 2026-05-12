import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { News } from './news.entity';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';
import { MailService } from '../mail/mail.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(News)
    private repo: Repository<News>,
    private mailService: MailService,
    @Inject(forwardRef(() => NewsletterService))
    private newsletterService: NewsletterService,
  ) {}

  async create(dto: CreateNewsDto, imageFile?: Express.Multer.File): Promise<News> {
    const news = this.repo.create({
      titre: dto.titre,
      description: dto.description || '',
      categorie: dto.categorie || '',
      statut: dto.statut || 'brouillon',
      newsletter_envoye: dto.newsletter_envoye || false,
      image: imageFile ? imageFile.filename : '',
    });
    
    const saved = await this.repo.save(news);
    this.logger.log(`Nouvelle annonce créée: ${saved.titre}`);
    return saved;
  }

  async findAll(): Promise<News[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findPublished(): Promise<News[]> {
    return this.repo.find({ 
      where: { statut: In(['publie', 'envoye']) }, 
      order: { createdAt: 'DESC' } 
    });
  }

  // ==================== MÉTHODE UNIQUE POUR TOUS LES UTILISATEURS ====================
  // Récupère les news UNIQUEMENT si l'utilisateur (startup OU expert) est abonné à la newsletter
  async getNewsForUser(userId: number): Promise<{ canView: boolean; news: News[]; message?: string }> {
    const isSubscribed = await this.newsletterService.isSubscribedByUserId(userId);
    
    if (!isSubscribed) {
      this.logger.log(`Utilisateur ${userId} non abonné - accès aux news refusé`);
      return { 
        canView: false, 
        news: [],
        message: "Vous devez vous abonner à la newsletter pour voir les actualités."
      };
    }
    
    this.logger.log(`Utilisateur ${userId} abonné - retour des news`);
    const news = await this.repo.find({ 
      where: { statut: In(['publie', 'envoye']) }, 
      order: { createdAt: 'DESC' } 
    });
    
    return { 
      canView: true, 
      news 
    };
  }

  // Compatibilité avec l'ancien nom (appelé par l'espace startup)
  async getNewsForStartup(userId: number): Promise<{ canView: boolean; news: News[]; message?: string }> {
    return this.getNewsForUser(userId);
  }

  async findOne(id: number): Promise<News> {
    const news = await this.repo.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`Annonce avec l'id ${id} non trouvée`);
    }
    return news;
  }

  async getLatest(limit: number = 5): Promise<News[]> {
    return this.repo.find({
      where: { statut: In(['publie', 'envoye']) },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async search(keyword: string): Promise<News[]> {
    if (!keyword) return this.findPublished();
    return this.repo.find({
      where: [
        { titre: Like(`%${keyword}%`), statut: In(['publie', 'envoye']) },
        { description: Like(`%${keyword}%`), statut: In(['publie', 'envoye']) },
        { categorie: Like(`%${keyword}%`), statut: In(['publie', 'envoye']) },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateNewsDto, imageFile?: Express.Multer.File): Promise<News> {
    const news = await this.findOne(id);
    
    if (imageFile) {
      if (news.image) {
        const oldPath = path.join(process.cwd(), 'uploads/news', news.image);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            this.logger.warn(`Impossible de supprimer l'ancienne image: ${oldPath}`);
          }
        }
      }
      news.image = imageFile.filename;
    }
    
    if (dto.titre !== undefined) news.titre = dto.titre;
    if (dto.description !== undefined) news.description = dto.description;
    if (dto.categorie !== undefined) news.categorie = dto.categorie;
    if (dto.statut !== undefined) news.statut = dto.statut;
    if (dto.newsletter_envoye !== undefined) news.newsletter_envoye = dto.newsletter_envoye;
    
    const updated = await this.repo.save(news);
    this.logger.log(`Annonce mise à jour: ${updated.titre}`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const news = await this.findOne(id);
    if (news.image) {
      const imagePath = path.join(process.cwd(), 'uploads/news', news.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          this.logger.warn(`Impossible de supprimer l'image: ${imagePath}`);
        }
      }
    }
    await this.repo.delete(id);
    this.logger.log(`Annonce supprimée: id ${id}`);
  }

  async updateStatus(id: number, statut: string): Promise<News> {
    const news = await this.findOne(id);
    news.statut = statut;
    if (statut === 'envoye') {
      news.newsletter_envoye = true;
    }
    const updated = await this.repo.save(news);
    this.logger.log(`Statut de l'annonce "${news.titre}" mis à jour: ${statut}`);
    return updated;
  }

  // ==================== ENVOI DE NEWSLETTER ====================
  async sendNewsletter(id: number): Promise<{ success: boolean; message: string; sent?: number; total?: number }> {
    const news = await this.findOne(id);
    
    if (news.newsletter_envoye) {
      return { success: false, message: 'Cette annonce a déjà été envoyée par newsletter' };
    }

    const subscribers = await this.newsletterService.getAll();
    
    if (subscribers.length === 0) {
      return { success: false, message: 'Aucun abonné actif' };
    }

    const imageUrl = news.image 
      ? `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/news/${news.image}`
      : null;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const htmlContent = this.buildEmailTemplate(news, imageUrl, frontendUrl);

    let sent = 0;
    for (const subscriber of subscribers) {
      try {
        await this.mailService.sendEmail(
          subscriber.email,
          `📰 ${news.titre} - Business Expert Hub`,
          htmlContent
        );
        sent++;
        this.logger.log(`Newsletter envoyée à ${subscriber.email}`);
      } catch (err) {
        this.logger.error(`Erreur envoi à ${subscriber.email}: ${err.message}`);
      }
    }

    news.newsletter_envoye = true;
    if (sent === subscribers.length) {
      news.statut = 'envoye';
    }
    await this.repo.save(news);

    this.logger.log(`Newsletter "${news.titre}" envoyée à ${sent}/${subscribers.length} abonnés`);
    
    return { 
      success: true, 
      message: `Newsletter envoyée à ${sent} abonné(s) sur ${subscribers.length}`,
      sent,
      total: subscribers.length
    };
  }

  private buildEmailTemplate(news: News, imageUrl: string | null, frontendUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.escapeHtml(news.titre)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1B3A4B, #00897B); padding: 32px 24px; text-align: center; }
          .header h1 { color: #F7B500; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px; }
          .content { padding: 32px 28px; }
          .category { display: inline-block; background: #E3F2FD; color: #1565C0; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          .title { font-size: 26px; font-weight: 800; color: #1A2B3C; margin-bottom: 16px; line-height: 1.3; }
          .description { color: #475569; line-height: 1.7; margin-bottom: 24px; font-size: 15px; }
          ${imageUrl ? `.image { text-align: center; margin-bottom: 24px; } .image img { max-width: 100%; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }` : ''}
          .btn-container { text-align: center; margin: 24px 0 16px; }
          .btn { display: inline-block; background: #F7B500; color: #0A2540; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; }
          .footer { background-color: #F8FAFC; padding: 24px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
          .footer a { color: #F7B500; text-decoration: none; }
        </style>
      </head>
      <body>
        <div style="padding: 20px;">
          <div class="container">
            <div class="header">
              <h1>Business Expert Hub</h1>
              <p>Accompagnement des startups vers l'excellence</p>
            </div>
            <div class="content">
              <div class="category">${this.escapeHtml(news.categorie || 'Actualité')}</div>
              <div class="title">${this.escapeHtml(news.titre)}</div>
              ${imageUrl ? `<div class="image"><img src="${imageUrl}" alt="${this.escapeHtml(news.titre)}"/></div>` : ''}
              <div class="description">${this.escapeHtml(news.description || '').replace(/\n/g, '<br/>')}</div>
              <div class="btn-container">
                <a href="${frontendUrl}/actualites" class="btn">Lire la suite</a>
              </div>
            </div>
            <div class="footer">
              <p>Business Expert Hub - Votre partenaire de confiance</p>
              <p>© ${new Date().getFullYear()} Business Expert Hub. Tous droits réservés.</p>
              <p><a href="${frontendUrl}/newsletter/unsubscribe">Se désabonner</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}