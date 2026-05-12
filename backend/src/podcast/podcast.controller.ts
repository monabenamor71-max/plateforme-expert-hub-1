// src/podcast/podcast.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PodcastService } from './podcast.service';
import { CreatePodcastDto, UpdatePodcastDto } from './dto/podcast.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from '../user/expert.entity';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

const podcastStorage = diskStorage({
  destination: (req, file, cb) => {
    let folder = './uploads/';
    if (file.fieldname === 'video_file') folder += 'podcasts-audio';
    else if (file.fieldname === 'image_file') folder += 'podcasts-images';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `podcast-${unique}${extname(file.originalname)}`);
  },
});

@Controller('podcasts')
export class PodcastController {
  constructor(
    private readonly podcastService: PodcastService,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  // ==================== EXPERTS ====================
  
  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  async proposerParExpert(
    @Body(ValidationPipe) dto: CreatePodcastDto,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: RequestWithUser,
  ) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: req.user.id },
      relations: ['user']
    });

    if (!expert || !expert.user) {
      throw new Error('Expert non trouvé');
    }

    const video = files?.video_file?.[0];
    const image = files?.image_file?.[0];
    
    return this.podcastService.createByExpert(dto, expert.id, expert.user, video, image);
  }

  @Get('expert/mes-podcasts')
  @UseGuards(JwtAuthGuard)
  async getMesPodcasts(@Request() req: RequestWithUser) {
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) throw new BadRequestException('Expert non trouvé');
    return this.podcastService.findByExpert(expert.id);
  }

  @Put('expert/modifier/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  async modifierParExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePodcastDto,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: RequestWithUser,
  ) {
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) throw new BadRequestException('Expert non trouvé');
    
    const video = files?.video_file?.[0];
    const image = files?.image_file?.[0];
    
    return this.podcastService.updateByExpert(id, expert.id, dto, video, image);
  }

  // ✅ ROUTE DE SUPPRESSION AJOUTÉE
  @Delete('expert/supprimer/:id')
  @UseGuards(JwtAuthGuard)
  async supprimerParExpert(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    const expert = await this.expertRepo.findOne({ where: { user_id: req.user.id } });
    if (!expert) throw new BadRequestException('Expert non trouvé');
    return this.podcastService.deleteByExpert(id, expert.id);
  }

  // ==================== PUBLIQUES ====================
  
  @Get('public')
  async findPublished() {
    return this.podcastService.findPublished();
  }

  // ==================== ADMIN ====================
  
  @Get('admin/all')
  async findAll() {
    return this.podcastService.findAll();
  }
}