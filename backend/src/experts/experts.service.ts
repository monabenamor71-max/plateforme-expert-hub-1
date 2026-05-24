import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
import { UpdateProfilDto } from './dto/update-profil.dto';

@Injectable()
export class ExpertsService {
  private readonly logger = new Logger(ExpertsService.name);

  constructor(
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
    private httpService: HttpService,   // ← INJECTION POUR APPEL HTTP
  ) {}

  async getMoi(userId: number) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) return null;
    return {
      ...expert,
      nom: expert.user.nom,
      prenom: expert.user.prenom,
      email: expert.user.email,
      telephone: expert.user.telephone,
      valide: expert.statut === 'valide',
    };
  }

  async getListe() {
    return this.expertRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllForAdmin() {
    return this.expertRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDomaines(domaines: string[]) {
    if (!domaines || domaines.length === 0) return [];
    return this.expertRepo.find({
      where: {
        domaine: In(domaines),
        statut: 'valide',
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ ANALYSE CV
  async analyzeCv(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert) {
      throw new NotFoundException(`Expert ${expertId} non trouvé`);
    }
    if (!expert.cv_text) {
      throw new BadRequestException('Aucun texte de CV disponible pour cet expert.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:5000/analyze-cv', {
          expert_id: expertId,
          cv_text: expert.cv_text,
        }),
      );

      const analysis = response.data;

      // Sauvegarde des résultats
      await this.expertRepo.update(expertId, {
        cv_analysis_score: analysis.score,
        cv_analysis_skills: JSON.stringify(analysis.skills),
        cv_analysis_decision: analysis.decision,
        cv_analysis_explanation: analysis.explanation,
      });

      return analysis;
    } catch (error) {
      this.logger.error(`Erreur appel IA pour expert ${expertId}: ${error.message}`);
      throw new BadRequestException('Le service d’analyse de CV est temporairement indisponible');
    }
  }

  async updateProfil(userId: number, body: any) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const modifications: any = {};
    if (body.domaine !== undefined && body.domaine !== '') modifications.domaine = body.domaine;
    if (body.description !== undefined) modifications.description = body.description;
    if (body.localisation !== undefined && body.localisation !== '') modifications.localisation = body.localisation;
    if (body.experience !== undefined && body.experience !== '') modifications.experience = body.experience;
    if (body.telephone !== undefined && body.telephone !== '') modifications.telephone = body.telephone;
    if (body.annee_debut_experience !== undefined && body.annee_debut_experience !== '') {
      modifications.annee_debut_experience = String(body.annee_debut_experience);
    }

    if (Object.keys(modifications).length === 0) {
      return { message: 'Aucune modification à enregistrer' };
    }

    const updateResult = await this.expertRepo.update({ user_id: userId }, {
      modifications_en_attente: JSON.stringify(modifications),
      modification_demandee: true,
    });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible d’enregistrer la demande de modification');
    }

    this.logger.log(`Expert ${userId} a demandé une modification de profil`);

    try {
      await this.mailService.sendAdminNotification(
        expert.user.nom,
        'Modification profil expert',
        expert.user.email,
      );
    } catch(e) {
      this.logger.error(`Erreur envoi email admin pour expert ${userId}: ${e.message}`);
    }

    return { message: 'Modification envoyée à l’admin pour validation' };
  }

  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId }, relations: ['user'] });
    if (!expert) throw new NotFoundException(`Expert ${expertId} non trouvé`);
    if (!expert.modifications_en_attente) {
      return { message: 'Aucune modification en attente' };
    }

    const modifications = JSON.parse(expert.modifications_en_attente);

    const expertUpdate: any = {};
    if (modifications.domaine !== undefined) expertUpdate.domaine = modifications.domaine;
    if (modifications.description !== undefined) expertUpdate.description = modifications.description;
    if (modifications.localisation !== undefined) expertUpdate.localisation = modifications.localisation;
    if (modifications.experience !== undefined) expertUpdate.experience = modifications.experience;
    if (modifications.annee_debut_experience !== undefined) {
      const annee = parseInt(modifications.annee_debut_experience, 10);
      if (!isNaN(annee)) expertUpdate.annee_debut_experience = annee;
    }

    const updateResult = await this.expertRepo.update(expertId, {
      ...expertUpdate,
      modifications_en_attente: '',
      modification_demandee: false,
    });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de valider la modification');
    }

    if (modifications.telephone) {
      const userUpdateResult = await this.userRepo.update(expert.user_id, {
        telephone: modifications.telephone,
      });
      if (userUpdateResult.affected === 0) {
        throw new BadRequestException('Impossible de mettre à jour le téléphone');
      }
    }

    this.logger.log(`Modification validée pour expert ${expertId}`);
    return { message: 'Modification validée' };
  }

  async refuserModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert) throw new NotFoundException(`Expert ${expertId} non trouvé`);
    const updateResult = await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de refuser la modification');
    }
    this.logger.log(`Modification refusée pour expert ${expertId}`);
    return { message: 'Modification refusée' };
  }

  async updateExpertDirectly(expertId: number, dto: UpdateProfilDto) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const expertUpdate: any = {};
    if (dto.domaine !== undefined) expertUpdate.domaine = dto.domaine;
    if (dto.description !== undefined) expertUpdate.description = dto.description;
    if (dto.localisation !== undefined) expertUpdate.localisation = dto.localisation;
    if (dto.experience !== undefined) expertUpdate.experience = dto.experience;
    if (dto.annee_debut_experience !== undefined && dto.annee_debut_experience !== null) {
      expertUpdate.annee_debut_experience = dto.annee_debut_experience;
    }

    const updateExpertResult = await this.expertRepo.update(expertId, expertUpdate);
    if (updateExpertResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour le profil expert');
    }

    if (dto.telephone !== undefined && dto.telephone !== '') {
      const updateUserResult = await this.userRepo.update(expert.user_id, { telephone: dto.telephone });
      if (updateUserResult.affected === 0) {
        throw new BadRequestException('Impossible de mettre à jour le téléphone');
      }
    }

    const resetResult = await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });
    if (resetResult.affected === 0) {
      throw new BadRequestException('Impossible de réinitialiser la demande de modification');
    }

    this.logger.log(`Admin a modifié directement l'expert ${expertId}`);
    return { message: 'Profil mis à jour directement' };
  }

  async updatePhoto(userId: number, filename: string) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException(`Expert pour user ${userId} non trouvé`);
    const updateResult = await this.expertRepo.update({ user_id: userId }, { photo: filename });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour la photo');
    }
    this.logger.log(`Photo mise à jour pour expert ${userId}`);
    return { message: 'Photo mise à jour' };
  }
}