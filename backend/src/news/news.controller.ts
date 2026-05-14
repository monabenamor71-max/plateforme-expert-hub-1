// src/news/news.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

// Dossier d'upload
const uploadDir = './uploads/news';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `news-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ==================== ROUTES PUBLIQUES ====================
  @Get('public')
  getPublishedNews() {
    return this.newsService.findPublished();
  }

  @Get('my-news')
  @UseGuards(JwtAuthGuard)
  async getMyNews(@Req() req: any) {
    const userId = req.user.id;
    return this.newsService.getNewsForUser(userId);
  }

  @Get('startup')
  @UseGuards(JwtAuthGuard)
  async getNewsForStartup(@Req() req: any) {
    const userId = req.user.id;
    return this.newsService.getNewsForUser(userId);
  }

  @Get('expert')
  @UseGuards(JwtAuthGuard)
  async getNewsForExpert(@Req() req: any) {
    const userId = req.user.id;
    return this.newsService.getNewsForUser(userId);
  }

  @Get('latest')
  getLatest(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.newsService.getLatest(limitNum);
  }

  @Get('search')
  search(@Query('q') keyword: string) {
    return this.newsService.search(keyword);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  // ==================== ROUTES ADMIN ====================
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.newsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'attachment', maxCount: 1 },
      ],
      { storage, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  create(
    @Body() dto: CreateNewsDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; attachment?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const attachmentFile = files?.attachment?.[0];
    return this.newsService.create(dto, imageFile, attachmentFile);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'attachment', maxCount: 1 },
      ],
      { storage, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; attachment?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const attachmentFile = files?.attachment?.[0];
    return this.newsService.update(id, dto, imageFile, attachmentFile);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('statut') statut: string) {
    return this.newsService.updateStatus(id, statut);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/send-newsletter')
  sendNewsletter(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.sendNewsletter(id);
  }
}