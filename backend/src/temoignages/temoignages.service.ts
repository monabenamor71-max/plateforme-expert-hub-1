import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from './temoignage.entity';

export class CreateTemoignageDto {
  user_id: number;
  texte: string;
  note?: number;
}

export class UpdateTemoignageDto {
  texte: string;
  note: number;
}

@Injectable()
export class TemoignagesService {
  private readonly logger = new Logger(TemoignagesService.name);

  constructor(
    @InjectRepository(Temoignage)
    private temoRepo: Repository<Temoignage>,
  ) {}

  async create(createTemoignageDto: CreateTemoignageDto) {
    const { user_id, texte, note } = createTemoignageDto;
    if (!texte || texte.trim().length === 0) {
      throw new BadRequestException('Le texte du témoignage ne peut pas être vide');
    }
    const t = this.temoRepo.create({ 
      user_id, 
      texte, 
      note: note || 5,
      statut: 'en_attente'
    });
    const saved = await this.temoRepo.save(t);
    this.logger.log(`Témoignage créé pour l'utilisateur ${user_id}`);
    return saved;
  }

  async getAll() {
    return this.temoRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublics() {
    return this.temoRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMesTemoignages(user_id: number) {
    return this.temoRepo.find({
      where: { user_id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Temoignage | null> {
    return this.temoRepo.findOne({ where: { id } });
  }

  async valider(id: number) {
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    await this.temoRepo.update(id, { statut: 'valide' });
    this.logger.log(`Témoignage ${id} validé`);
    return { message: 'Témoignage validé' };
  }

  async refuser(id: number) {
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    await this.temoRepo.update(id, { statut: 'refuse' });
    this.logger.log(`Témoignage ${id} refusé`);
    return { message: 'Témoignage refusé' };
  }

  // AJOUT: MODIFIER UN TÉMOIGNAGE
  async update(id: number, userId: number, updateData: UpdateTemoignageDto) {
    this.logger.log(`Tentative de modification du témoignage ${id} par l'utilisateur ${userId}`);
    
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (temoignage.user_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres témoignages');
    }
    
    if (!updateData.texte || updateData.texte.trim().length === 0) {
      throw new BadRequestException('Le texte du témoignage ne peut pas être vide');
    }
    
    await this.temoRepo.update(id, { 
      texte: updateData.texte,
      note: updateData.note,
      statut: 'en_attente'
    });
    
    const updated = await this.temoRepo.findOne({ where: { id } });
    this.logger.log(`Témoignage ${id} modifié avec succès`);
    return updated;
  }

  async supprimer(id: number) {
    this.logger.log(`Tentative de suppression du témoignage ${id}`);
    
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    
    await this.temoRepo.delete(id);
    this.logger.log(`Témoignage ${id} supprimé avec succès`);
    return { message: 'Témoignage supprimé avec succès' };
  }
}