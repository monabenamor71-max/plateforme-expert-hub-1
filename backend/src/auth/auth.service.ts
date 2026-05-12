import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { RegisterExpertDto } from './dto/register-expert.dto';
import { RegisterStartupDto } from './dto/register-startup.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private extractFileName(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    return path.basename(filePath);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async registerExpert(
    dto: RegisterExpertDto,
    photoPath?: string,
    cvPath?: string,
    portfolioPath?: string,
  ) {
    const { email, password, nom, prenom, telephone, domaine, annee_debut_experience, localisation, description } = dto;
    this.logger.log(`Tentative d'inscription expert: ${email}`);

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || '',
      role: 'expert',
      statut: 'en_attente',
      photo: this.extractFileName(photoPath),
      email_verified: false,
    });
    const savedUser = await this.userRepo.save(user);

    const expert = this.expertRepo.create({
      user_id: savedUser.id,
      domaine: domaine || '',
      annee_debut_experience: annee_debut_experience,
      localisation: localisation || '',
      description: description || '',
      statut: 'en_attente',
      cv: this.extractFileName(cvPath),
      portfolio: this.extractFileName(portfolioPath),
    });
    await this.expertRepo.save(expert);

    const confirmationToken = this.jwtService.sign(
      { id: savedUser.id, email },
      { expiresIn: '24h' }
    );
    savedUser.reset_code = confirmationToken;
    savedUser.email_verified = false;
    await this.userRepo.save(savedUser);

    // ✅ UNIQUEMENT EMAIL DE CONFIRMATION (PAS À L'ADMIN)
    await this.mailService.sendConfirmationEmail(email, confirmationToken);

    return { message: 'Inscription réussie. Veuillez confirmer votre email.' };
  }

  async registerStartup(dto: RegisterStartupDto) {
    const { email, password, nom, prenom, telephone, nom_startup, secteur, fonction, taille, site_web, localisation, description } = dto;
    this.logger.log(`Tentative d'inscription startup: ${email}`);

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || '',
      role: 'startup',
      statut: 'en_attente',
      email_verified: false,
    });
    const savedUser = await this.userRepo.save(user);

    const startup = this.startupRepo.create({
      user_id: savedUser.id,
      nom_startup,
      secteur,
      fonction,
      taille,
      site_web,
      localisation,
      description,
      statut: 'en_attente',
    });
    await this.startupRepo.save(startup);

    const confirmationToken = this.jwtService.sign(
      { id: savedUser.id, email },
      { expiresIn: '24h' }
    );
    savedUser.reset_code = confirmationToken;
    savedUser.email_verified = false;
    await this.userRepo.save(savedUser);

    // ✅ UNIQUEMENT EMAIL DE CONFIRMATION (PAS À L'ADMIN)
    await this.mailService.sendConfirmationEmail(email, confirmationToken);

    return { message: 'Inscription réussie. Veuillez confirmer votre email.' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Identifiants incorrects');
    if (!await bcrypt.compare(password, user.password)) throw new BadRequestException('Identifiants incorrects');
    if (user.statut !== 'actif') throw new BadRequestException('Compte non activé par l’administrateur');
    if (!user.email_verified) throw new BadRequestException('Veuillez confirmer votre email avant de vous connecter');

    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '1h' }
    );

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
      },
    };
  }

  // ✅ CORRECTION CRUCIALE : Notification à l'admin APRÈS confirmation email
  async confirmEmail(token: string) {
    this.logger.log(`Tentative de confirmation email`);
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) throw new BadRequestException('Utilisateur non trouvé');
      if (user.email_verified) throw new BadRequestException('Email déjà confirmé');
      
      user.email_verified = true;
      user.reset_code = '';
      await this.userRepo.save(user);
      this.logger.log(`Email confirmé pour user ${user.id}`);

      // 🔔 NOTIFICATION À L'ADMIN - UNIQUEMENT MAINTENANT
      try {
        if (user.role === 'expert') {
          const expert = await this.expertRepo.findOne({ where: { user_id: user.id } });
          if (expert) {
            await this.mailService.sendAdminNotification(
              `${user.prenom} ${user.nom}`,
              'expert',
              user.email
            );
            this.logger.log(`📧 Notification admin envoyée pour expert ${user.email}`);
          }
        } else if (user.role === 'startup') {
          const startup = await this.startupRepo.findOne({ where: { user_id: user.id } });
          if (startup) {
            await this.mailService.sendAdminNotification(
              `${user.prenom} ${user.nom} (${startup.nom_startup})`,
              'startup',
              user.email
            );
            this.logger.log(`📧 Notification admin envoyée pour startup ${user.email}`);
          }
        }
      } catch (error) {
        this.logger.error(`❌ Erreur envoi notification admin: ${error.message}`);
      }

      return { message: 'Email confirmé avec succès.' };
    } catch (err) {
      throw new BadRequestException('Lien de confirmation invalide ou expiré');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Aucun compte associé à cet email');

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    user.reset_code = resetCode;
    user.reset_code_expires = expires;
    await this.userRepo.save(user);

    await this.mailService.sendResetCodeEmail(email, resetCode);
    return { message: 'Un code de réinitialisation a été envoyé à votre adresse email.' };
  }

  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email invalide');
    if (user.reset_code !== code) throw new BadRequestException('Code incorrect');
    if (!user.reset_code_expires || user.reset_code_expires < new Date()) {
      throw new BadRequestException('Code expiré');
    }
    if (newPassword.length < 6) throw new BadRequestException('Mot de passe trop court');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_code = '';
    user.reset_code_expires = new Date(0);
    await this.userRepo.save(user);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async resetPassword(token: string, newPassword: string) {
    throw new BadRequestException('Utilisez la méthode avec code à 6 chiffres');
  }
}