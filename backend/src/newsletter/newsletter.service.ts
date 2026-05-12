import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './newsletter.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../user/user.entity';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(Newsletter)
    private repo: Repository<Newsletter>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const { email, nom } = dto;
    try {
      let sub = await this.repo.findOne({ where: { email } });
      if (sub) {
        if (!sub.actif) {
          await this.repo.update(sub.id, { actif: true });
          this.logger.log(`Abonné ${email} réactivé`);
          return { success: true, message: 'Inscription réactivée' };
        }
        return { success: true, message: 'Déjà inscrit', alreadyExists: true };
      }

      const newSub = this.repo.create({ email, nom, actif: true });
      await this.repo.save(newSub);
      this.logger.log(`Nouvel abonné newsletter : ${email}`);

      await this.sendWelcomeEmail(email, nom).catch(err =>
        this.logger.error(`Erreur envoi email bienvenue à ${email} : ${err.message}`)
      );

      return { success: true, message: 'Inscription réussie' };
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription ${email} : ${error.message}`);
      throw new BadRequestException("Erreur lors de l'inscription à la newsletter");
    }
  }

  private async sendWelcomeEmail(email: string, nom?: string) {
    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#F7B500;margin:0">Bienvenue chez Business Expert Hub</h2>
      </div>
      <div style="padding:24px;background:#F7F9FC;border-radius:0 0 12px 12px">
        <p>Bonjour <strong>${nom || email}</strong>,</p>
        <p>Vous êtes maintenant inscrit à notre newsletter. Vous recevrez toutes nos actualités, nouveaux experts, formations et opportunités.</p>
        <p style="color:#8A9AB5;font-size:13px">- L'équipe BEH</p>
      </div>
    </div>`;
    await this.mailService.sendEmail(email, 'Bienvenue dans la newsletter BEH !', html);
  }

  async getAll() {
    return this.repo.find({ where: { actif: true }, order: { createdAt: 'DESC' } });
  }

  // ==================== MÉTHODE PRINCIPALE ====================
  // Vérifie si un utilisateur (via son userId) est abonné à la newsletter
  async isSubscribedByUserId(userId: number): Promise<boolean> {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user || !user.email) {
        this.logger.warn(`Utilisateur ${userId} non trouvé ou sans email`);
        return false;
      }

      const subscriber = await this.repo.findOne({ 
        where: { email: user.email, actif: true } 
      });
      
      const isSubscribed = !!subscriber;
      this.logger.log(`Utilisateur ${userId} (${user.email}) abonné newsletter: ${isSubscribed}`);
      return isSubscribed;
    } catch (error) {
      this.logger.error(`Erreur isSubscribedByUserId: ${error.message}`);
      return false;
    }
  }

  // Vérifie simplement par email
  async isSubscribed(email: string): Promise<boolean> {
    const subscriber = await this.repo.findOne({ 
      where: { email, actif: true } 
    });
    return !!subscriber;
  }
}