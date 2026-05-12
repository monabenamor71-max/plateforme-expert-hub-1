// src/startups/startups.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Startup } from '../user/startup.entity';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { UpdateStartupDto } from './dto/update-startup.dto';

const SECTEUR_TO_DOMAINES: Record<string, string[]> = {
  'Technologie': ['Développement Web / Mobile', 'Intelligence Artificielle / Data', 'DevOps', 'Cybersécurité'],
  'Finance': ['Finance / Comptabilité', 'Juridique / Fiscal', 'Data Analyse'],
  'Santé': ['Marketing Digital', 'Data Santé', 'Juridique / Fiscal'],
  'E-commerce': ['Marketing Digital', 'Logistique / Supply Chain', 'Design UI/UX', 'Développement Web / Mobile'],
  'Éducation': ['Marketing Digital', 'Développement Web / Mobile', 'Design UI/UX'],
  'Transport': ['Logistique / Supply Chain', '', 'Data Analyse'],
  'Agroalimentaire': ['Marketing Digital', 'Logistique / Supply Chain', 'Juridique / Fiscal'],
};

@Injectable()
export class StartupsService {
  private readonly logger = new Logger(StartupsService.name);

  constructor(
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
  ) {}

  async getMoi(userId: number) {
    this.logger.log(`🔍 Recherche startup pour user_id = ${userId}`);
    let startup = await this.startupRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!startup) {
      this.logger.log(`⚠️ Aucune startup pour user_id ${userId}, recherche d'une startup sans propriétaire...`);
      startup = await this.startupRepo.findOne({
        where: { user_id: IsNull() },
        relations: ['user'],
      });
      if (startup) {
        const updateResult = await this.startupRepo.update(startup.id, { user_id: userId });
        if (updateResult.affected === 0) {
          throw new BadRequestException('Impossible d’attribuer la startup à l’utilisateur');
        }
        this.logger.log(`✅ Startup "${startup.nom_startup}" attribuée à l'utilisateur ${userId}`);
        startup = await this.startupRepo.findOne({
          where: { id: startup.id },
          relations: ['user'],
        });
        if (!startup) {
          throw new BadRequestException('Impossible de recharger la startup après attribution');
        }
      } else {
        this.logger.log(`🆕 Création d'une nouvelle startup pour l'utilisateur ${userId}`);
        const newStartup = this.startupRepo.create({
          nom_startup: `Startup de ${userId}`,
          user_id: userId,
          statut: 'valide',
        });
        const savedStartup = await this.startupRepo.save(newStartup);
        if (!savedStartup || !savedStartup.id) {
          throw new BadRequestException('Erreur lors de la création de la startup');
        }
        startup = await this.startupRepo.findOne({
          where: { id: savedStartup.id },
          relations: ['user'],
        });
        if (!startup) {
          throw new BadRequestException('Impossible de recharger la startup après création');
        }
      }
    }

    if (!startup) {
      throw new NotFoundException(`Impossible de récupérer ou créer une startup pour l'utilisateur ${userId}`);
    }

    this.logger.log(`✅ Startup trouvée : ID ${startup.id}, nom "${startup.nom_startup}"`);
    return {
      ...startup,
      nom: startup.user?.nom || '',
      prenom: startup.user?.prenom || '',
      email: startup.user?.email || '',
    };
  }

  async getListe() {
    return this.startupRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
    });
  }

  async updateProfil(userId: number, updateDto: UpdateStartupDto) {
    const startup = await this.startupRepo.findOne({ where: { user_id: userId } });
    if (!startup) {
      throw new NotFoundException(`Startup pour l'utilisateur ${userId} introuvable`);
    }
    
    const updateData: Partial<Startup> = {};
    if (updateDto.nom_startup !== undefined) updateData.nom_startup = updateDto.nom_startup;
    if (updateDto.secteur !== undefined) updateData.secteur = updateDto.secteur;
    if (updateDto.taille !== undefined) updateData.taille = updateDto.taille;
    if (updateDto.site_web !== undefined) updateData.site_web = updateDto.site_web;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.fonction !== undefined) updateData.fonction = updateDto.fonction;
    if (updateDto.localisation !== undefined) updateData.localisation = updateDto.localisation;
    
    const updateResult = await this.startupRepo.update(
      { user_id: userId },
      updateData
    );
    
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour le profil startup');
    }
    this.logger.log(`📝 Mise à jour profil : ${updateResult.affected} ligne(s) modifiée(s) pour user_id ${userId}`);
    return { message: 'Profil mis à jour' };
  }

  async updatePhoto(userId: number, filename: string) {
    const startup = await this.startupRepo.findOne({ where: { user_id: userId } });
    if (!startup) {
      throw new NotFoundException(`Startup pour l'utilisateur ${userId} introuvable`);
    }
    const updateResult = await this.startupRepo.update({ user_id: userId }, { photo: filename });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour la photo');
    }
    return { message: 'Photo mise à jour' };
  }

  async getAllStartups() {
    return this.startupRepo.find();
  }

  async getAllStartupUsers() {
    return this.userRepo.find({ where: { role: 'startup' } });
  }

  async updateStartupUserId(startupId: number, userId: number) {
    const startup = await this.startupRepo.findOne({ where: { id: startupId } });
    if (!startup) {
      throw new NotFoundException(`Startup ${startupId} introuvable`);
    }
    const updateResult = await this.startupRepo.update(startupId, { user_id: userId });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour l’utilisateur associé à la startup');
    }
    return { success: true, affected: updateResult.affected };
  }

  async getRecommendedExperts(userId: number) {
    const startup = await this.startupRepo.findOne({ where: { user_id: userId } });
    if (!startup || !startup.secteur) {
      return this.expertRepo.find({
        where: { statut: 'valide' },
        relations: ['user'],
      });
    }

    const domainesRecommandes = SECTEUR_TO_DOMAINES[startup.secteur] || [];
    const tousLesExperts = await this.expertRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
    });

    const expertsAvecDomaine = tousLesExperts.filter(e => e.domaine);

    const expertsTries = expertsAvecDomaine.sort((a, b) => {
      const aMatch = domainesRecommandes.includes(a.domaine!);
      const bMatch = domainesRecommandes.includes(b.domaine!);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return expertsTries;
  }
}