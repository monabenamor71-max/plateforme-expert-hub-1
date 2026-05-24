// backend/src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly adminEmail = 'plateformebeh@gmail.com';
  private readonly baseUrl: string;

  constructor() {
    // ✅ Important : baseUrl doit être le frontend (port 3000)
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.logger.log(`🌐 Base URL utilisée pour les liens dans les emails : ${this.baseUrl}`);

    const emailPass = process.env.EMAIL_APP_PASS || 'eeby aygp htye hwvu';
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'plateformebeh@gmail.com',
        pass: emailPass,
      },
      tls: { rejectUnauthorized: false },
    });
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Connexion SMTP établie avec succès');
    } catch (error) {
      this.logger.error(`❌ Échec SMTP : ${error.message}`);
    }
  }

  // ==================== TEMPLATE DE BASE ====================
  private getBaseHtml(content: string, button?: { url: string; text: string }) {
    const buttonHtml = button
      ? `<div style="text-align: center; margin: 30px 0;">
           <a href="${button.url}" style="background: #F7B500; color: #0A2540; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-block;">${button.text}</a>
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0; padding:0; background:#F0F4FA; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(10,37,64,0.12);">
          <div style="background: #0A2540; padding: 28px 24px; text-align: center;">
            <div style="display: inline-block; background: #F7B500; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 20px; font-weight: 900; color: #0A2540;">BEH</div>
            <h1 style="margin: 16px 0 0; font-size: 20px; color: #FFFFFF; font-weight: 700;">Business Expert Hub</h1>
          </div>
          <div style="padding: 32px 32px 40px;">
            ${content}
            ${buttonHtml}
            <hr style="border: none; border-top: 1px solid #E8EEF6; margin: 32px 0 16px;">
            <p style="font-size: 12px; color: #8A9AB5; text-align: center;">Business Expert Hub – Accompagnement des startups par des experts certifiés</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== ENVOI GÉNÉRIQUE ====================
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"BEH — Business Expert Hub" <plateformebeh@gmail.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`✅ Email envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email à ${to} : ${error.message}`);
      throw error;
    }
  }

  // ==================== CONFIRMATION D'EMAIL ====================
// src/mail/mail.service.ts (extrait modifié)
async sendConfirmationEmail(email: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const confirmLink = `${frontendUrl}/confirmation?token=${token}`;
  console.log(`\n📧 LIEN DE CONFIRMATION pour ${email} :\n${confirmLink}\n`);
  this.logger.log(`Lien : ${confirmLink}`);

  const content = `
    <h2 style="color: #0A2540; font-size: 22px; margin-bottom: 12px;">Bienvenue sur BEH 🚀</h2>
    <p style="color: #475569; font-size: 15px; line-height: 1.6;">Merci de vous être inscrit. Avant de continuer, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>
    <p style="color: #64748B; font-size: 13px; margin-top: 20px;">Ce lien expire dans 24 heures.</p>
    <p style="margin-top: 20px; font-size: 13px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/><a href="${confirmLink}" style="word-break: break-all;">${confirmLink}</a></p>
  `;

  const html = this.getBaseHtml(content, { url: confirmLink, text: '✅ Confirmer mon compte' });
  await this.sendEmail(email, 'Confirmation de votre adresse email', html);
}

  // ==================== NOTIFICATION ADMIN (INSCRIPTION) ====================
  async sendAdminNotification(nom: string, role: string, email: string) {
    console.log(`🔔 NOUVELLE INSCRIPTION ${role.toUpperCase()} : ${nom} (${email})`);

    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📋 Nouvelle inscription ${role === 'expert' ? 'Expert' : 'Startup'}</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong style="color:#0A2540;">Nom :</strong> ${nom}</p>
        <p style="margin: 0;"><strong style="color:#0A2540;">Email :</strong> ${email}</p>
      </div>
      <p style="color:#475569;">Connectez-vous à l’espace administration pour valider ou refuser ce compte.</p>
    `;

    const adminDashboardUrl = `${this.baseUrl}/dashboard/admin`;
    const html = this.getBaseHtml(content, { url: adminDashboardUrl, text: '📊 Accéder à l’admin' });
    await this.sendEmail(this.adminEmail, `Nouvelle inscription ${role}`, html);
  }

  // ✅ Activation de compte (après validation admin)
  async sendAccountActivatedEmail(to: string, userName: string) {
    const loginUrl = `${this.baseUrl}/connexion`;
    
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Félicitations, ${userName} ! 🎉</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Votre compte a été validé par notre équipe administrative. Vous pouvez désormais accéder à votre espace et profiter de toutes les fonctionnalités de BEH.</p>
      <p style="color: #64748B; font-size: 13px; margin-top: 16px;">Connectez-vous dès maintenant pour découvrir nos services.</p>
    `;

    const html = this.getBaseHtml(content, { url: loginUrl, text: '🔑 Se connecter' });
    await this.sendEmail(to, '✅ Votre compte BEH est activé', html);
    this.logger.log(`Email d'activation envoyé à ${to}`);
  }

  // ✅ Refus de compte
  async sendAccountRejectedEmail(to: string, userName: string) {
    const contactUrl = `${this.baseUrl}/contact`;
    
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Bonjour ${userName},</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Nous avons examiné votre inscription avec attention. Malheureusement, elle n’a pas été retenue à ce stade.</p>
      <p style="color: #64748B; font-size: 13px; margin-top: 16px;">N’hésitez pas à nous contacter pour plus d’informations. L’équipe BEH reste à votre disposition.</p>
    `;

    const html = this.getBaseHtml(content, { url: contactUrl, text: '📞 Nous contacter' });
    await this.sendEmail(to, '📋 Mise à jour de votre inscription BEH', html);
    this.logger.log(`Email de rejet envoyé à ${to}`);
  }

  // ==================== NOTIFICATION DEMANDE DE SERVICE ====================
  async sendDemandeServiceNotification(
    userNom: string,
    userPrenom: string,
    userEmail: string,
    userTelephone: string,
    serviceType: string,
    domaine: string,
    description: string,
    objectif: string,
    delai: string,
    startupNom?: string,
    secteur?: string
  ) {
    this.logger.log(`🔔 Nouvelle demande de service de ${userPrenom} ${userNom} - ${serviceType}`);

    const serviceLabels: Record<string, string> = {
      'consulting': 'Consulting Stratégique',
      'audit-sur-site': 'Audit sur site',
      'nos-plateformes': 'Nos Plateformes (Développement)',
      'formation-sur-mesure': 'Formation sur mesure',
      'formations': 'Formation existante',
      'formation': 'Formation existante',
    };
    const serviceLabel = serviceLabels[serviceType] || serviceType;

    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📋 Nouvelle demande de service</h2>
      
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">👤 Informations du demandeur</h3>
        <p style="margin: 0 0 8px;"><strong>Nom complet :</strong> ${userPrenom} ${userNom}</p>
        <p style="margin: 0 0 8px;"><strong>Email :</strong> ${userEmail}</p>
        <p style="margin: 0 0 8px;"><strong>Téléphone :</strong> ${userTelephone || 'Non renseigné'}</p>
        ${startupNom ? `<p style="margin: 0 0 8px;"><strong>Startup :</strong> ${startupNom}</p>` : ''}
        ${secteur ? `<p style="margin: 0 0 8px;"><strong>Secteur d'activité :</strong> ${secteur}</p>` : ''}
      </div>

      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">🎯 Détails de la demande</h3>
        <p style="margin: 0 0 8px;"><strong>Type de service :</strong> <span style="background: #F7B50020; padding: 3px 10px; border-radius: 99px; font-weight: 600;">${serviceLabel}</span></p>
        <p style="margin: 0 0 8px;"><strong>Domaine :</strong> ${domaine || 'Non spécifié'}</p>
        <p style="margin: 0 0 8px;"><strong>Objectif :</strong> ${objectif || 'Non spécifié'}</p>
        <p style="margin: 0 0 8px;"><strong>Délai souhaité :</strong> ${delai || 'Non spécifié'}</p>
      </div>

      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">📝 Description détaillée</h3>
        <p style="margin: 0; line-height: 1.6;">${description?.replace(/\n/g, '<br>') || 'Non renseignée'}</p>
      </div>

      <p style="color:#475569; margin-top: 20px;">Cette demande nécessite votre attention. Connectez-vous à l’espace administration pour gérer cette demande et notifier des experts.</p>
    `;

    const adminDemandesUrl = `${this.baseUrl}/dashboard/admin/demandes`;
    const html = this.getBaseHtml(content, { url: adminDemandesUrl, text: '📊 Gérer les demandes' });
    
    await this.sendEmail(this.adminEmail, `📬 Nouvelle demande de service - ${serviceLabel} - ${userPrenom} ${userNom}`, html);
  }

  // ==================== NOTIFICATION FORMATION PROPOSÉE PAR EXPERT ====================
  async sendFormationProposeeNotification(
    expertPrenom: string,
    expertNom: string,
    expertEmail: string,
    formationTitre: string,
    domaine: string,
    description: string
  ) {
    this.logger.log(`🔔 Nouvelle formation proposée par expert ${expertPrenom} ${expertNom}`);

    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📚 Nouvelle formation proposée par un expert</h2>
      
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">👤 Informations de l'expert</h3>
        <p style="margin: 0 0 8px;"><strong>Nom :</strong> ${expertPrenom} ${expertNom}</p>
        <p style="margin: 0 0 8px;"><strong>Email :</strong> ${expertEmail}</p>
      </div>

      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">🎓 Détails de la formation</h3>
        <p style="margin: 0 0 8px;"><strong>Titre :</strong> ${formationTitre}</p>
        <p style="margin: 0 0 8px;"><strong>Domaine :</strong> ${domaine || 'Non spécifié'}</p>
        <p style="margin: 0 0 8px;"><strong>Description :</strong></p>
        <p style="background: white; padding: 12px; border-radius: 12px;">${description?.replace(/\n/g, '<br>') || 'Non renseignée'}</p>
      </div>

      <p style="color:#475569; margin-top: 20px;">Cette formation est en attente de validation. Connectez-vous à l’espace administration pour l'examiner et la publier.</p>
    `;

    const adminFormationsUrl = `${this.baseUrl}/dashboard/admin/formations`;
    const html = this.getBaseHtml(content, { url: adminFormationsUrl, text: '📊 Gérer les formations' });
    
    await this.sendEmail(this.adminEmail, `📚 Nouvelle formation proposée - ${formationTitre}`, html);
  }

  // ==================== NOTIFICATION PODCAST PROPOSÉ PAR EXPERT ====================
  async sendPodcastProposeeNotification(
    expertPrenom: string,
    expertNom: string,
    expertEmail: string,
    podcastTitre: string,
    domaine: string,
    description: string
  ) {
    this.logger.log(`🔔 Nouveau podcast proposé par expert ${expertPrenom} ${expertNom}`);

    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">🎙️ Nouveau podcast proposé par un expert</h2>
      
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">👤 Informations de l'expert</h3>
        <p style="margin: 0 0 8px;"><strong>Nom :</strong> ${expertPrenom} ${expertNom}</p>
        <p style="margin: 0 0 8px;"><strong>Email :</strong> ${expertEmail}</p>
      </div>

      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <h3 style="color: #F7B500; font-size: 14px; margin-bottom: 12px;">🎬 Détails du podcast</h3>
        <p style="margin: 0 0 8px;"><strong>Titre :</strong> ${podcastTitre}</p>
        <p style="margin: 0 0 8px;"><strong>Domaine :</strong> ${domaine || 'Non spécifié'}</p>
        <p style="margin: 0 0 8px;"><strong>Description :</strong></p>
        <p style="background: white; padding: 12px; border-radius: 12px;">${description?.replace(/\n/g, '<br>') || 'Non renseignée'}</p>
      </div>

      <p style="color:#475569; margin-top: 20px;">Ce podcast est en attente de validation. Connectez-vous à l’espace administration pour l'examiner et le publier.</p>
    `;

    const adminPodcastsUrl = `${this.baseUrl}/dashboard/admin/podcasts`;
    const html = this.getBaseHtml(content, { url: adminPodcastsUrl, text: '📊 Gérer les podcasts' });
    
    await this.sendEmail(this.adminEmail, `🎙️ Nouveau podcast proposé - ${podcastTitre}`, html);
  }

  // ==================== VALIDATION DU COMPTE ====================
  async sendValidationEmail(nom: string, email: string) {
    const loginUrl = `${this.baseUrl}/connexion`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Félicitations, ${nom} ! 🎉</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Votre compte a été validé par notre équipe. Vous pouvez désormais accéder à votre espace et profiter de toutes les fonctionnalités de BEH.</p>
    `;

    const html = this.getBaseHtml(content, { url: loginUrl, text: '🔑 Se connecter' });
    await this.sendEmail(email, '✅ Votre compte BEH est activé', html);
  }

  // ==================== REFUS DU COMPTE ====================
  async sendRefusEmail(nom: string, email: string) {
    const contactUrl = `${this.baseUrl}/contact`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Bonjour ${nom},</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Nous avons examiné votre inscription. Malheureusement, elle n’a pas été retenue à ce stade. N’hésitez pas à nous recontacter pour plus d’informations.</p>
      <p style="color: #64748B; font-size: 13px;">L’équipe BEH reste à votre disposition.</p>
    `;

    const html = this.getBaseHtml(content, { url: contactUrl, text: '📞 Nous contacter' });
    await this.sendEmail(email, 'Votre inscription BEH', html);
  }

  // ==================== NOTIFICATION CONTACT ADMIN ====================
  async sendContactNotification(nom: string, prenom: string, email: string, sujet: string, message: string) {
    const adminContactsUrl = `${this.baseUrl}/dashboard/admin/contacts`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📩 Nouveau message de contact</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p><strong>Nom complet :</strong> ${prenom} ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${sujet}</p>
        <p><strong>Message :</strong></p>
        <p style="background: white; padding: 12px; border-radius: 12px;">${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="color:#475569;">Connectez-vous à l’espace administration pour consulter l’historique complet.</p>
    `;

    const html = this.getBaseHtml(content, { url: adminContactsUrl, text: '📋 Voir tous les messages' });
    await this.sendEmail(this.adminEmail, `📬 Nouveau message de contact - ${sujet}`, html);
  }

  // ==================== RÉPONSE AUX MESSAGES DE CONTACT ====================
  async sendReplyEmail(to: string, nom: string, reponse: string) {
    const content = `
      <h2 style="color: #0A2540;">Réponse de l'équipe BEH</h2>
      <p>Bonjour ${nom},</p>
      <div style="background: #F8FAFC; padding: 16px; border-radius: 12px; margin: 16px 0;">
        ${reponse.replace(/\n/g, '<br>')}
      </div>
      <p>Cordialement,<br/>L’équipe Business Expert Hub</p>
    `;
    const html = this.getBaseHtml(content);
    await this.sendEmail(to, 'Réponse à votre message', html);
  }

  // ==================== MODIFICATION DE PROFIL (admin) ====================
  async sendModificationNotification(nom: string, email: string) {
    const adminDashboardUrl = `${this.baseUrl}/dashboard/admin`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px;">✏️ Modification de profil demandée</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p><strong>Expert :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
      </div>
      <p>Connectez-vous à l’administration pour examiner et approuver ces modifications.</p>
    `;

    const html = this.getBaseHtml(content, { url: adminDashboardUrl, text: '🔧 Gérer la modification' });
    await this.sendEmail(this.adminEmail, '🔔 Modification de profil expert en attente', html);
  }

  // ==================== RÉINITIALISATION PAR CODE ====================
  async sendResetCodeEmail(email: string, code: string) {
    const content = `
      <h2 style="color: #0A2540; font-size: 20px;">Code de réinitialisation</h2>
      <p style="color: #475569;">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code unique :</p>
      <div style="background: #F7F9FC; border-radius: 12px; padding: 14px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 20px 0;">${code}</div>
      <p style="color: #64748B; font-size: 13px;">Ce code expire dans 15 minutes. Ne le partagez avec personne.</p>
    `;

    const html = this.getBaseHtml(content);
    await this.sendEmail(email, 'Code de réinitialisation BEH', html);
  }

  // ==================== RÉINITIALISATION PAR LIEN ====================
  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${this.baseUrl}/reset-password?token=${token}`;
    const content = `
      <h2 style="color: #0A2540;">Réinitialisation de votre mot de passe</h2>
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
      <p style="margin-top: 16px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/><a href="${resetLink}">${resetLink}</a></p>
    `;

    const html = this.getBaseHtml(content, { url: resetLink, text: '🔐 Réinitialiser mon mot de passe' });
    await this.sendEmail(email, 'Réinitialisation mot de passe BEH', html);
  }
}