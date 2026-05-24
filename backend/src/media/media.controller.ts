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
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
import type { Request } from 'express';

const videoStorage = diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'miniature_file') {
      cb(null, './uploads/videos-miniatures');
    } else if (file.fieldname === 'video_file') {
      cb(null, './uploads/videos');
    } else {
      cb(new Error('Champ non autorisé'), '');
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = file.fieldname === 'miniature_file' ? 'miniature' : 'video';
    cb(null, `${prefix}-${unique}${extname(file.originalname)}`);
  },
});

const videoFileFilter = (req: Request, file: Express.Multer.File, cb) => {
  if (file.fieldname === 'miniature_file') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont autorisées pour la miniature'), false);
    } else {
      cb(null, true);
    }
  } else if (file.fieldname === 'video_file') {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Seules les vidéos sont autorisées pour le fichier vidéo'), false);
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error('Champ de fichier non autorisé'), false);
  }
};

@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Routes admin
  @Post('videos/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'miniature_file', maxCount: 1 },
        { name: 'video_file', maxCount: 1 },
      ],
      { storage: videoStorage, fileFilter: videoFileFilter, limits: { fileSize: 500 * 1024 * 1024 } },
    ),
  )
  async create(
    @Body(ValidationPipe) createDto: CreateMediaDto,
    @UploadedFiles() files: { miniature_file?: Express.Multer.File[]; video_file?: Express.Multer.File[] },
  ) {
    const miniature = files.miniature_file?.[0];
    const video = files.video_file?.[0];
    return this.mediaService.create(createDto, miniature, video);
  }

  @Get('videos/admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllAdmin() {
    return this.mediaService.findAllAdmin();
  }

  @Get('videos/admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Put('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'miniature_file', maxCount: 1 },
        { name: 'video_file', maxCount: 1 },
      ],
      { storage: videoStorage, fileFilter: videoFileFilter, limits: { fileSize: 500 * 1024 * 1024 } },
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateMediaDto,
    @UploadedFiles() files: { miniature_file?: Express.Multer.File[]; video_file?: Express.Multer.File[] },
  ) {
    const miniature = files.miniature_file?.[0];
    const video = files.video_file?.[0];
    return this.mediaService.update(id, updateDto, miniature, video);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }

  // Routes publiques
  @Get('videos/public')
  async findPublished(@Query('featured') featured?: string) {
    return this.mediaService.findPublished(featured === 'true');
  }

  @Get('videos/public/:id')
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOnePublic(id);
  }
}