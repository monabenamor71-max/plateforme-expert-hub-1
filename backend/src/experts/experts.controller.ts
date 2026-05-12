import {
  Controller, Get, Put, Patch, Post, Body, Param, Request,
  UseGuards, UseInterceptors, UploadedFile, Query,
  ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ExpertsService } from './experts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestModificationDto } from './dto/request-modification.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';
import type { Request as ExpressRequest } from 'express';

// Interface pour typer la requête avec l'utilisateur
interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

@Controller('experts')
export class ExpertsController {
  constructor(private expertsService: ExpertsService) {}

  @Get()
  getAll() {
    return this.expertsService.getListe();
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  getMoi(@Request() req: RequestWithUser) {
    return this.expertsService.getMoi(req.user.id);
  }

  @Get('liste')
  getListe() {
    return this.expertsService.getListe();
  }

  @Get('by-domaines')
  async getExpertsByDomaines(@Query('domaines') domaines: string) {
    if (!domaines) return [];
    const domainesArray = domaines.split(',');
    return this.expertsService.findByDomaines(domainesArray);
  }

  @Put('profil')
  @UseGuards(JwtAuthGuard)
  updateProfil(@Request() req: RequestWithUser, @Body() body: any) {
    return this.expertsService.updateProfil(req.user.id, body);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  async updateExpertByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfilDto,
  ) {
    return this.expertsService.updateExpertDirectly(id, dto);
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
        return cb(new BadRequestException('Format d\'image non supporté'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(@Request() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Aucune photo fournie, profil non modifié' };
    }
    return this.expertsService.updatePhoto(req.user.id, file.filename);
  }

  @Patch(':id/valider-modification')
  @UseGuards(JwtAuthGuard)
  validerModification(@Param('id', ParseIntPipe) id: number) {
    return this.expertsService.validerModification(id);
  }

  @Patch(':id/refuser-modification')
  @UseGuards(JwtAuthGuard)
  refuserModification(@Param('id', ParseIntPipe) id: number) {
    return this.expertsService.refuserModification(id);
  }
}