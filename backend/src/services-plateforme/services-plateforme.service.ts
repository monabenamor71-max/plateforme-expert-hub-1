import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePlateforme } from './service-plateforme.entity';

@Injectable()
export class ServicesPlateformeService {
  constructor(
    @InjectRepository(ServicePlateforme)
    private repo: Repository<ServicePlateforme>,
  ) {}

  getPublic(type?: string) {
    const q = this.repo.createQueryBuilder('s')
      .leftJoinAndSelect('s.proposant', 'u')
      .where('s.statut = :s', { s: 'publie' });
    if (type) q.andWhere('s.type = :t', { t: type });
    return q.orderBy('s.createdAt', 'DESC').getMany();
  }

  getAll() {
    return this.repo.find({ relations: ['proposant'], order: { createdAt: 'DESC' } });
  }

  getEnAttente() {
    return this.repo.find({ where: { statut: 'en_attente' }, relations: ['proposant'], order: { createdAt: 'DESC' } });
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['proposant'] });
  }

  async create(data: any) {
    const s = this.repo.create({ ...data, statut: 'publie' });
    return this.repo.save(s);
  }

  async proposer(userId: number, data: any) {
    const s = this.repo.create({
      ...data,
      propose_par: userId,
      propose_par_expert: true,
      statut: 'en_attente',
      type: 'formation',
    });
    return this.repo.save(s);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async publier(id: number) {
    await this.repo.update(id, { statut: 'publie' });
    return this.repo.findOne({ where: { id } });
  }

  async refuser(id: number, commentaire?: string) {
    await this.repo.update(id, { statut: 'refuse', commentaire_admin: commentaire });
    return this.repo.findOne({ where: { id } });
  }

  async archiver(id: number) {
    await this.repo.update(id, { statut: 'archive' });
    return { message: 'Archive' };
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { message: 'Supprime' };
  }

  getMesFormations(userId: number) {
    return this.repo.find({ where: { propose_par: userId }, order: { createdAt: 'DESC' } });
  }
}
