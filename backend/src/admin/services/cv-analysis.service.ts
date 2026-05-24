import { Injectable, HttpException, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
// Correction de l'import pour form-data
import FormData = require('form-data');
import { Expert } from '../../user/expert.entity';

@Injectable()
export class CvAnalysisService {
  private readonly FASTAPI_URL = 'http://localhost:5000/analyze-cv-pdf';
  private readonly logger = new Logger(CvAnalysisService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Expert)
    private readonly expertRepo: Repository<Expert>,
  ) {}

  async analyzeCvByExpertId(expertId: number): Promise<any> {
    this.logger.log(`Analyse CV demandée pour l'expert ${expertId}`);

    const expert = await this.expertRepo.findOne({
      where: { id: expertId },
      relations: ['user'],
    });
    if (!expert) {
      throw new NotFoundException(`Expert ${expertId} introuvable`);
    }
    if (!expert.cv) {
      throw new HttpException(
        `L'expert ${expert.user?.prenom} ${expert.user?.nom} n'a pas de CV associé`,
        HttpStatus.NOT_FOUND,
      );
    }

    const cvPath = path.join(process.cwd(), 'uploads', 'cv', expert.cv);
    if (!fs.existsSync(cvPath)) {
      throw new HttpException(`Fichier CV introuvable : ${expert.cv}`, HttpStatus.NOT_FOUND);
    }

    const fileBuffer = fs.readFileSync(cvPath);
    const form = new FormData(); // Maintenant constructible
    form.append('file', fileBuffer, { filename: expert.cv, contentType: 'application/pdf' });

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.FASTAPI_URL, form, {
          headers: {
            ...form.getHeaders(),
          },
        }),
      );
      this.logger.log(`Analyse terminée pour l'expert ${expertId} : score ${response.data.score}`);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail || error.message;
      this.logger.error(`Erreur lors de l'analyse du CV de l'expert ${expertId} : ${detail}`);
      throw new HttpException(
        `Erreur lors de l'analyse du CV : ${detail}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}