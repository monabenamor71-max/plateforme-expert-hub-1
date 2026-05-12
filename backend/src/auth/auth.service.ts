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
      this.logger.warn(`Tentative d'inscription avec email déjà existant: ${email}`);
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
    if (!savedUser || !savedUser.id) {
      this.logger.error(`Échec sauvegarde utilisateur expert: ${email}`);
      throw new BadRequestException('Erreur lors de la création de l’utilisateur');
    }

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

    await this.mailService.sendConfirmationEmail(email, confirmationToken);
    await this.mailService.sendAdminNotification(`${prenom} ${nom}`, 'expert', email);

    this.logger.log(`Inscription expert réussie: ${email} (ID user ${savedUser.id})`);
    return { message: 'Inscription réussie. Un email de confirmation vous a été envoyé.' };
  }

  async registerStartup(dto: RegisterStartupDto) {
    const { email, password, nom, prenom, telephone, nom_startup, secteur, fonction, taille, site_web, localisation, description } = dto;
    this.logger.log(`Tentative d'inscription startup: ${email}`);

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      this.logger.warn(`Tentative d'inscription startup avec email déjà existant: ${email}`);
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
    if (!savedUser || !savedUser.id) {
      this.logger.error(`Échec sauvegarde utilisateur startup: ${email}`);
      throw new BadRequestException('Erreur lors de la création de l’utilisateur');
    }

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

    await this.mailService.sendConfirmationEmail(email, confirmationToken);
    await this.mailService.sendAdminNotification(`${prenom} ${nom} (${nom_startup})`, 'startup', email);

    this.logger.log(`Inscription startup réussie: ${email} (ID user ${savedUser.id})`);
    return { message: 'Inscription réussie. Un email de confirmation vous a été envoyé.' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    this.logger.log(`Tentative de connexion: ${email}`);

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Échec connexion: email non trouvé ${email}`);
      throw new BadRequestException('Identifiants incorrects');
    }
    if (!await bcrypt.compare(password, user.password)) {
      this.logger.warn(`Échec connexion: mauvais mot de passe pour ${email}`);
      throw new BadRequestException('Identifiants incorrects');
    }
    if (user.statut !== 'actif') {
      this.logger.warn(`Échec connexion: compte inactif ${email}`);
      throw new BadRequestException('Compte non activé par l’administrateur');
    }
    if (!user.email_verified) {
      this.logger.warn(`Échec connexion: email non confirmé ${email}`);
      throw new BadRequestException('Veuillez confirmer votre adresse email avant de vous connecter');
    }

    // ✅ CORRECTION : ajout de l'expiration du token (1 heure ici)
    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '1h' }   // ← durée de validité du token de connexion
    );

    this.logger.log(`Connexion réussie: ${email} (rôle ${user.role})`);
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

  async confirmEmail(token: string) {
    this.logger.log(`Tentative de confirmation email avec token`);
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) {
        this.logger.warn(`Token invalide: utilisateur non trouvé`);
        throw new BadRequestException('Utilisateur non trouvé');
      }
      if (user.email_verified) {
        this.logger.warn(`Email déjà confirmé pour user ${user.id}`);
        throw new BadRequestException('Email déjà confirmé');
      }
      user.email_verified = true;
      user.reset_code = '';
      await this.userRepo.save(user);
      this.logger.log(`Email confirmé avec succès pour user ${user.id}`);
      return { message: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.' };
    } catch (err) {
      this.logger.error(`Erreur lors de la confirmation email: ${err.message}`);
      throw new BadRequestException('Lien de confirmation invalide ou expiré');
    }
  }

  async forgotPassword(email: string) {
    this.logger.log(`Demande de réinitialisation pour ${email}`);
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Email non trouvé pour réinitialisation: ${email}`);
      throw new BadRequestException('Aucun compte associé à cet email');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    user.reset_code = resetCode;
    user.reset_code_expires = expires;
    await this.userRepo.save(user);

    await this.mailService.sendResetCodeEmail(email, resetCode);
    this.logger.log(`Code de réinitialisation envoyé pour ${email}`);
    return { message: 'Un code de réinitialisation a été envoyé à votre adresse email.' };
  }

  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    this.logger.log(`Tentative de réinitialisation avec code pour ${email}`);
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Email invalide pour réinitialisation: ${email}`);
      throw new BadRequestException('Email invalide');
    }

    if (user.reset_code !== code) {
      this.logger.warn(`Code incorrect pour ${email}`);
      throw new BadRequestException('Code incorrect.');
    }
    if (!user.reset_code_expires || user.reset_code_expires < new Date()) {
      this.logger.warn(`Code expiré pour ${email}`);
      throw new BadRequestException('Code expiré, veuillez refaire une demande.');
    }

    if (newPassword.length < 6) {
      this.logger.warn(`Mot de passe trop court pour ${email}`);
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_code = '';
    user.reset_code_expires = new Date(0);
    await this.userRepo.save(user);

    this.logger.log(`Mot de passe réinitialisé avec succès pour ${email}`);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.warn(`Appel de la méthode obsolète resetPassword`);
    throw new BadRequestException('Utilisez la méthode avec code à 6 chiffres');
  }
}