import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Devis } from './devis.entity';
import { DemandeService } from '../demandes-service/demande-service.entity';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';

@Injectable()
export class DevisService {
  private readonly logger = new Logger(DevisService.name);

  constructor(
    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,
    @InjectRepository(DemandeService)
    private demandeRepo: Repository<DemandeService>,
  ) {}

  async create(userId: number, dto: CreateDevisDto) {
    const expert = await this.devisRepo.manager
      .createQueryBuilder()
      .select('expert')
      .from('expert', 'expert')
      .where('expert.user_id = :userId', { userId })
      .getOne();
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const demande = await this.demandeRepo.findOne({ where: { id: dto.demande_id } });
    if (!demande) throw new NotFoundException('Demande non trouvée');

    let acceptes = demande.experts_acceptes || [];
    if (acceptes.length && typeof acceptes[0] === 'object') {
      acceptes = acceptes.map((a: any) => a.expert_id || a.id);
    }
    if (!acceptes.includes(expert.id)) {
      throw new BadRequestException("Vous n'avez pas accepté cette mission");
    }
    if (demande.statut === 'acceptee' || demande.expert_assigne_id) {
      throw new BadRequestException('Cette mission a déjà été attribuée');
    }

    const devis = this.devisRepo.create({
      demande_id: dto.demande_id,
      expert_id: expert.id,
      montant: dto.montant,
      description: dto.description,
      delai: dto.delai,
      statut: 'en_attente',
    });
    const savedDevis = await this.devisRepo.save(devis);

    demande.statut = 'devis_envoye';
    await this.demandeRepo.save(demande);

    this.logger.log(`Devis créé par expert ${expert.id} pour demande ${demande.id}`);
    return savedDevis;
  }

  async findByExpert(userId: number) {
    const expert = await this.devisRepo.manager
      .createQueryBuilder()
      .select('expert')
      .from('expert', 'expert')
      .where('expert.user_id = :userId', { userId })
      .getOne();
    if (!expert) return [];
    return this.devisRepo.find({
      where: { expert_id: expert.id },
      relations: ['demande', 'demande.user', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(userId: number) {
    const demandes = await this.demandeRepo.find({
      where: { user_id: userId },
      select: ['id'],
    });
    const demandeIds = demandes.map(d => d.id);
    if (demandeIds.length === 0) return [];
    return this.devisRepo.find({
      where: { demande_id: In(demandeIds) },
      relations: ['demande', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.devisRepo.find({
      relations: ['demande', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatutByClient(devisId: number, clientUserId: number, dto: UpdateStatutDto) {
    this.logger.log(`updateStatutByClient appelé pour devis ${devisId}, client ${clientUserId}, statut demandé ${dto.statut}`);

    const devis = await this.devisRepo.findOne({
      where: { id: devisId },
      relations: ['demande', 'expert'],
    });
    if (!devis) throw new NotFoundException('Devis non trouvé');

    const demande = devis.demande;
    if (!demande) throw new NotFoundException('Demande associée introuvable');

    if (demande.user_id !== clientUserId) {
      throw new UnauthorizedException('Vous ne pouvez pas modifier ce devis');
    }
    if (devis.statut !== 'en_attente') {
      throw new BadRequestException('Ce devis a déjà été traité');
    }

    if (dto.statut === 'accepte') {
      // Accepter le devis
      devis.statut = 'accepte';
      await this.devisRepo.save(devis);

      // ✅ Mettre à jour la demande
      demande.statut = 'acceptee';
      demande.expert_assigne_id = devis.expert_id;
      demande.devis_montant = devis.montant;
      await this.demandeRepo.save(demande);

      this.logger.log(`✅ Devis ${devisId} accepté - Demande ${demande.id} passe de ${demande.statut} à acceptee`);
      return { message: 'Devis accepté, mission attribuée à l\'expert' };
    } 
    else if (dto.statut === 'refuse') {
      devis.statut = 'refuse';
      await this.devisRepo.save(devis);
      this.logger.log(`Devis ${devisId} refusé par client ${clientUserId}`);
      return { message: 'Devis refusé' };
    } 
    else {
      throw new BadRequestException('Statut non valide. Utilisez "accepte" ou "refuse".');
    }
  }

  async updateStatut(devisId: number, dto: UpdateStatutDto) {
    const devis = await this.devisRepo.findOne({ where: { id: devisId } });
    if (!devis) throw new NotFoundException('Devis non trouvé');
    devis.statut = dto.statut;
    await this.devisRepo.save(devis);
    this.logger.log(`Devis ${devisId} : statut changé à ${dto.statut} par admin`);
    return { message: 'Statut mis à jour' };
  }
}