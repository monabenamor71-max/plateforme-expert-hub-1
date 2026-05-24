import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';
import { Devis } from '../devis/devis.entity';
import { FormationsService } from '../formations/formations.service';
import { MailService } from '../mail/mail.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { NotifierExpertsDto } from './dto/notifier-experts.dto';
import { SoumettreDevisDto } from './dto/soumettre-devis.dto';

@Injectable()
export class DemandesServiceService {
  private readonly logger = new Logger(DemandesServiceService.name);

  constructor(
    @InjectRepository(DemandeService)
    private repo: Repository<DemandeService>,
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,
    private formationsService: FormationsService,
    private mailService: MailService,
  ) {}

  // ==================== ADMIN ====================
  async getAll() {
    return this.repo.find({
      relations: ['user', 'formation', 'expert_assigne', 'expert_assigne.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatut(id: number, dto: UpdateStatutDto) {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande ${id} non trouvée`);

    const servicesSansRefusDirect = ['consulting', 'audit-sur-site', 'nos-plateformes', 'formation-sur-mesure'];
    if (dto.statut === 'refusee' && servicesSansRefusDirect.includes(demande.service) && demande.statut === 'en_attente') {
      throw new BadRequestException('Cette demande ne peut pas être refusée directement. Veuillez notifier des experts.');
    }

    demande.statut = dto.statut;
    if (dto.commentaire) demande.commentaire_admin = dto.commentaire;
    await this.repo.save(demande);
    this.logger.log(`Demande ${id} : statut changé à ${dto.statut}`);
    return { message: 'Statut mis à jour' };
  }

  async supprimer(id: number) {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande ${id} non trouvée`);
    await this.repo.remove(demande);
    return { message: 'Demande supprimée' };
  }

  async notifierExperts(demandeId: number, dto: NotifierExpertsDto) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const actuels = Array.isArray(demande.experts_notifies) ? demande.experts_notifies : [];
    const nouveaux = dto.expert_ids.filter(id => !actuels.includes(id));
    if (nouveaux.length === 0) return { message: 'Aucun nouvel expert à notifier' };

    demande.experts_notifies = [...actuels, ...nouveaux];
    if (demande.statut === 'en_attente') {
      demande.statut = 'notifie_experts';
    }
    await this.repo.save(demande);
    this.logger.log(`Experts notifiés pour demande ${demandeId} : ${nouveaux.join(',')}`);
    return { message: `${nouveaux.length} expert(s) notifié(s)` };
  }

  async getExpertsAcceptes(demandeId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    const acceptesIds = demande.experts_acceptes || [];
    if (acceptesIds.length === 0) return [];
    return this.expertRepo.find({ where: { id: In(acceptesIds) }, relations: ['user'] });
  }

  async acceptFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, service: 'formation' },
      relations: ['formation'],
    });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Cette demande a déjà été traitée');

    const formation = demande.formation;
    if (!formation) throw new NotFoundException('Formation associée introuvable');

    if (formation.places_limitees) {
      if ((formation.places_disponibles ?? 0) <= 0) {
        throw new BadRequestException(`La formation "${formation.titre}" n'a plus de places disponibles`);
      }
      await this.formationsService.decrementPlaces(formation.id);
    }

    demande.statut = 'acceptee';
    await this.repo.save(demande);
    return { message: 'Demande acceptée' };
  }

  async rejectFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, service: 'formation' },
      relations: ['formation'],
    });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const wasAccepted = demande.statut === 'acceptee';
    if (!['en_attente', 'acceptee'].includes(demande.statut))
      throw new BadRequestException('Cette demande ne peut pas être refusée dans son état actuel');

    if (wasAccepted && demande.formation) {
      await this.formationsService.incrementPlaces(demande.formation.id);
    }

    demande.statut = 'refusee';
    await this.repo.save(demande);
    return { message: 'Demande refusée' };
  }

  // ==================== STARTUPS ====================
  async getMesDemandes(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['formation', 'expert_assigne', 'expert_assigne.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateDemandeDto) {
    const userRepo = this.repo.manager.getRepository('User');
    const user = await userRepo.findOne({ where: { id: userId } });

    let startupNom = '', secteur = '';
    try {
      const startupRepo = this.repo.manager.getRepository('Startup');
      const startup = await startupRepo.findOne({ where: { user_id: userId } });
      if (startup) {
        startupNom = startup.nom_startup || '';
        secteur = startup.secteur || '';
      }
    } catch {}

    const data = { user_id: userId, ...dto, statut: 'en_attente' };
    const demande = this.repo.create(data);
    const saved = await this.repo.save(demande);
    // email admin...
    return saved;
  }

  async createFormationDemande(userId: number, formationId: number) {
    const formation = await this.formationRepo.findOne({ where: { id: formationId, statut: 'publie' } });
    if (!formation) throw new NotFoundException('Formation non trouvée ou non publiée');
    if (formation.places_limitees && (formation.places_disponibles ?? 0) <= 0)
      throw new BadRequestException(`Plus de places`);

    const demandeExistante = await this.repo.findOne({ where: { user_id: userId, service: 'formation', formation_id: formationId } });
    if (demandeExistante) throw new BadRequestException('Demande déjà soumise');

    const demande = this.repo.create({
      user_id: userId,
      service: 'formation',
      description: `Demande de participation : ${formation.titre}`,
      formation_id: formation.id,
      statut: 'en_attente',
    });
    const saved = await this.repo.save(demande);
    return saved;
  }

  async updateDemande(id: number, userId: number, dto: UpdateDemandeDto) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être modifiées');
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async deleteDemande(id: number, userId: number) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être supprimées');
    await this.repo.delete(id);
    return { success: true };
  }

  // ==================== EXPERTS ====================
  private async getExpertByUserId(userId: number): Promise<Expert> {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    return expert;
  }

  async getDemandesAssignees(userId: number) {
    const expert = await this.getExpertByUserId(userId);
    return this.repo.find({ where: { expert_assigne_id: expert.id }, relations: ['user', 'formation'] });
  }

  async getNotificationsForExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) return [];

    const demandes = await this.repo.find({
      where: [{ statut: 'en_attente' }, { statut: 'notifie_experts' }, { statut: 'devis_envoye' }],
      relations: ['user', 'formation', 'expert_assigne'],
    });

    return demandes.filter(d => {
      let notifies = Array.isArray(d.experts_notifies) ? d.experts_notifies : [];
      let acceptes = Array.isArray(d.experts_acceptes) ? d.experts_acceptes : [];
      if (notifies.length && typeof notifies[0] === 'object') notifies = notifies.map((n: any) => n.expert_id || n.id);
      if (acceptes.length && typeof acceptes[0] === 'object') acceptes = acceptes.map((a: any) => a.expert_id || a.id);
      const isNotified = notifies.includes(expert.id);
      const isDirectlyAssigned = d.expert_assigne_id === expert.id;
      return (isNotified || isDirectlyAssigned) && !acceptes.includes(expert.id);
    });
  }

  async getVisibleDemandesForExpert(userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demandes = await this.repo.find({ relations: ['user', 'formation', 'expert_assigne', 'expert_assigne.user'] });
    return demandes.filter(d => {
      let notifies = Array.isArray(d.experts_notifies) ? d.experts_notifies : [];
      let acceptes = Array.isArray(d.experts_acceptes) ? d.experts_acceptes : [];
      if (notifies.length && typeof notifies[0] === 'object') notifies = notifies.map((n: any) => n.expert_id || n.id);
      if (acceptes.length && typeof acceptes[0] === 'object') acceptes = acceptes.map((a: any) => a.expert_id || a.id);
      const isNotified = notifies.includes(expert.id);
      const isDirectlyAssigned = d.expert_assigne_id === expert.id;
      const hasAlreadyAccepted = acceptes.includes(expert.id);
      const assignedToOther = d.expert_assigne_id !== null && d.expert_assigne_id !== expert.id;
      return (isNotified || isDirectlyAssigned) && !hasAlreadyAccepted && !assignedToOther;
    });
  }

  async accepterMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    let notifies = demande.experts_notifies || [];
    if (notifies.length && typeof notifies[0] === 'object') notifies = notifies.map((n: any) => n.expert_id || n.id);
    if (!notifies.includes(expert.id)) throw new BadRequestException("Vous n'avez pas été notifié");
    if (demande.expert_assigne_id) throw new BadRequestException('Un expert est déjà assigné');

    let acceptes = demande.experts_acceptes || [];
    if (acceptes.length && typeof acceptes[0] === 'object') acceptes = acceptes.map((a: any) => a.expert_id || a.id);
    if (acceptes.includes(expert.id)) return { message: 'Vous avez déjà accepté' };

    demande.experts_acceptes = [...acceptes, expert.id];
    // ⚠️ NE PAS CHANGER demande.statut ICI
    await this.repo.save(demande);
    this.logger.log(`Expert ${expert.id} a accepté la mission ${demandeId}`);
    return { message: 'Acceptation enregistrée, vous pouvez soumettre un devis' };
  }

  async refuserMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    this.logger.log(`Expert ${expert.id} a refusé la mission ${demandeId}`);
    return { message: 'Refus enregistré' };
  }

  async soumettreDevis(userId: number, demandeId: number, dto: SoumettreDevisDto) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    let acceptes = demande.experts_acceptes || [];
    if (acceptes.length && typeof acceptes[0] === 'object') acceptes = acceptes.map((a: any) => a.expert_id || a.id);
    if (!acceptes.includes(expert.id)) throw new BadRequestException("Vous devez d'abord accepter la mission");

    if (demande.statut === 'acceptee' || demande.expert_assigne_id) throw new BadRequestException('Mission déjà attribuée');

    const devis = this.devisRepo.create({
      demande_id: demande.id,
      expert_id: expert.id,
      montant: dto.montant,
      description: dto.description,
      delai: dto.delai,
      statut: 'en_attente',
    });
    const savedDevis = await this.devisRepo.save(devis);

    demande.statut = 'devis_envoye';
    await this.repo.save(demande);
    this.logger.log(`Expert ${expert.id} a soumis un devis, demande ${demandeId} passe à devis_envoye`);
    return savedDevis;
  }

  async accepterDevis(clientUserId: number, devisId: number) {
    const devis = await this.devisRepo.findOne({ where: { id: devisId }, relations: ['demande'] });
    if (!devis) throw new NotFoundException(`Devis ${devisId} non trouvé`);

    const demande = devis.demande;
    if (!demande) throw new NotFoundException('Demande associée introuvable');
    if (demande.user_id !== clientUserId) throw new UnauthorizedException('Vous ne pouvez pas accepter ce devis');
    if (demande.statut !== 'devis_envoye') throw new BadRequestException('Aucun devis en attente pour cette demande');
    if (devis.statut !== 'en_attente') throw new BadRequestException('Ce devis a déjà été traité');

    devis.statut = 'accepte';
    await this.devisRepo.save(devis);

    demande.statut = 'acceptee';
    demande.expert_assigne_id = devis.expert_id;
    demande.devis_montant = devis.montant;
    await this.repo.save(demande);

    this.logger.log(`Client ${clientUserId} a accepté le devis ${devisId}, demande ${demande.id} passe à acceptee`);
    return { message: 'Devis accepté, mission attribuée à l’expert' };
  }
}