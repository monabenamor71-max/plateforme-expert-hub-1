// src/blog/blog.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseInterceptors, UploadedFiles,
  UseGuards, Query, ValidationPipe, ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService, CreateArticleDto, UpdateArticleDto, UpdateStatutDto } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

const storage = diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'image') {
      cb(null, './uploads/articles-img');
    } else {
      cb(null, './uploads/articles-pdf');
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    if (file.fieldname === 'image') {
      cb(null, `article-${unique}${extname(file.originalname)}`);
    } else {
      cb(null, `article-${unique}.pdf`);
    }
  },
});

@Controller('articles')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage }))
  async create(
    @Body(ValidationPipe) dto: CreateArticleDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.blogService.create(dto, imageFile, pdfFile);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin() {
    return this.blogService.findAllAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  // ✅ Route PUT complète (avec fichiers)
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateArticleDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.blogService.update(id, dto, imageFile, pdfFile);
  }

  // ✅ NOUVELLE ROUTE : PATCH générique pour mise à jour partielle (statut, titre, etc.)
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard)
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateArticleDto,
  ) {
    // Utilise la même méthode update sans fichiers
    return this.blogService.update(id, dto);
  }

  @Patch('admin/:id/statut')
async updateStatut(@Param('id') id: number, @Body() dto: UpdateStatutDto) {
  return this.blogService.updateStatut(id, dto);
}
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }

  @Get('public')
  async findPublished(@Query('categorie') categorie?: string) {
    return this.blogService.findPublished(categorie);
  }

  @Get('public/:id')
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOnePublic(id);
  }

  @Get('public/categories/list')
  async getCategories() {
    return this.blogService.getCategories();
  }
}