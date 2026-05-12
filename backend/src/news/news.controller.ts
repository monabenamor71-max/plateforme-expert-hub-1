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
  UploadedFile,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

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

  @Get('public')
  getPublishedNews() {
    return this.newsService.findPublished();
  }

  @Get('startup')
  @UseGuards(JwtAuthGuard)
  async getNewsForStartup(@Req() req: any) {
    const userId = req.user.id;
    return this.newsService.getNewsForStartup(userId);
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

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.newsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/create')
  @UseInterceptors(FileInterceptor('image', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  create(@Body() dto: CreateNewsDto, @UploadedFile() file?: Express.Multer.File) {
    return this.newsService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  @UseInterceptors(FileInterceptor('image', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: string,
  ) {
    return this.newsService.updateStatus(id, statut);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/send-newsletter')
  sendNewsletter(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.sendNewsletter(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/admin/news/create')
  @UseInterceptors(FileInterceptor('image', { storage, limits: { fileSize: 10 * 1024 * 1024 } }))
  createAlias(@Body() dto: CreateNewsDto, @UploadedFile() file?: Express.Multer.File) {
    return this.newsService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin/news/all')
  getAllAlias() {
    return this.newsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/admin/news/:id')
  deleteAlias(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/admin/news/:id/send-newsletter')
  sendNewsletterAlias(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.sendNewsletter(id);
  }
}