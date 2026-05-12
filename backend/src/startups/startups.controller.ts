import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { StartupsService } from './startups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateStartupDto } from './dto/update-startup.dto';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

@Controller('startups')
export class StartupsController {
  constructor(private startupsService: StartupsService) {}

  @Get('liste')
  getListe() {
    return this.startupsService.getListe();
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  async getMoi(@Request() req: RequestWithUser) {
    console.log(`📡 /startups/moi appelé par user ID: ${req.user.id}`);
    const result = await this.startupsService.getMoi(req.user.id);
    console.log(`📤 Résultat renvoyé: ${JSON.stringify(result)}`);
    return result;
  }

  @Put('profil')
  @UseGuards(JwtAuthGuard)
  updateProfil(@Request() req: RequestWithUser, @Body(ValidationPipe) updateDto: UpdateStartupDto) {
    console.log(`✏️ Mise à jour profil pour user ID: ${req.user.id}`);
    return this.startupsService.updateProfil(req.user.id, updateDto);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: path.join(process.cwd(), 'uploads', 'photos'),
      filename: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
    fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Le fichier doit être une image (jpg, jpeg, png, gif, webp)'), false);
      }
      cb(null, true);
    },
  }))
  uploadPhoto(@Request() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    console.log(`📸 Upload photo pour user ID: ${req.user.id}, fichier: ${file.filename}`);
    return this.startupsService.updatePhoto(req.user.id, file.filename);
  }

  @Get('experts-recommandes')
  @UseGuards(JwtAuthGuard)
  async getRecommendedExperts(@Request() req: RequestWithUser) {
    console.log(`🎯 /startups/experts-recommandes appelé par user ID: ${req.user.id}`);
    return this.startupsService.getRecommendedExperts(req.user.id);
  }
}