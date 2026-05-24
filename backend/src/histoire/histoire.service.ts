import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Histoire } from './histoire.entity';
import { UpdateHistoireDto } from './dto/histoire.dto';

@Injectable()
export class HistoireService {
  private readonly logger = new Logger(HistoireService.name);

  constructor(
    @InjectRepository(Histoire)
    private histoireRepository: Repository<Histoire>,
  ) {}

  async get(): Promise<Histoire> {
    let histoire = await this.histoireRepository.findOne({ where: { id: 1 } });
    if (!histoire) {
      this.logger.log('Aucune entrée histoire trouvée, création d’une nouvelle');
      histoire = this.histoireRepository.create({ id: 1 });
      histoire = await this.histoireRepository.save(histoire);
    }
    return histoire;
  }

  async update(updateDto: UpdateHistoireDto): Promise<Histoire> {
    let histoire = await this.histoireRepository.findOne({ where: { id: 1 } });
    if (!histoire) {
      this.logger.log('Création d’une nouvelle entrée histoire avec les données fournies');
      histoire = this.histoireRepository.create({ id: 1, ...updateDto });
    } else {
      Object.assign(histoire, updateDto);
    }
    const updated = await this.histoireRepository.save(histoire);
    this.logger.log('Page histoire mise à jour');
    return updated;
  }
}