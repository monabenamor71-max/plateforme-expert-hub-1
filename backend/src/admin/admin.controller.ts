// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Post,
  Put,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { CreatePodcastDto, UpdatePodcastDto } from '../podcast/dto/podcast.dto';

// Stockage pour les articles (images + PDF)
const articleStorage = diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'image') {
      cb(null, './uploads/articles-img');
    } else {
      cb(null, './uploads/articles-pdf');
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    if (file.fieldname === 'image') {
      cb(null, `article-${unique}${extname(file.originalname)}`);
    } else {
      cb(null, `article-${unique}.pdf`);
    }
  },
});

// Stockage pour les miniatures des médias (vidéos)
const mediaStorage = diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    cb(null, './uploads/videos-miniatures');
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `miniature-${unique}${extname(file.originalname)}`);
  },
});

// Stockage pour les podcasts (vidéo MP4 + image)
const podcastStorage = diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'video_file') {
      cb(null, './uploads/podcasts-audio');
    } else if (file.fieldname === 'image_file') {
      cb(null, './uploads/podcasts-images');
    } else {
      cb(new Error('Champ non autorisé'), '');
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `podcast-${unique}${extname(file.originalname)}`);
  },
});

// Filtre : seulement MP4 pour la vidéo, images pour l'image
const podcastFileFilter = (req: Request, file: Express.Multer.File, cb) => {
  if (file.fieldname === 'video_file') {
    if (file.mimetype !== 'video/mp4') {
      cb(new Error('Seuls les fichiers MP4 sont autorisés pour la vidéo'), false);
    } else {
      cb(null, true);
    }
  } else if (file.fieldname === 'image_file') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont autorisées'), false);
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error('Champ de fichier non autorisé'), false);
  }
};

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== USERS ====================
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: number) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/statut')
  toggleStatut(@Param('id') id: number, @Body() body: any) {
    return this.adminService.toggleUserStatut(id, body.statut);
  }

  // ==================== EXPERTS ====================
  @Get('experts')
  getAllExperts() {
    return this.adminService.getAllExperts();
  }

  @Get('experts/attente')
  getExpertEnAttente() {
    return this.adminService.getExpertEnAttente();
  }

  @Patch('experts/:id/valider')
  validerExpert(@Param('id') id: number) {
    return this.adminService.validerExpert(id);
  }

  @Patch('experts/:id/refuser')
  refuserExpert(@Param('id') id: number) {
    return this.adminService.refuserExpert(id);
  }

  @Get('experts/modifications')
  getExpertsModifications() {
    return this.adminService.getExpertsModifications();
  }

  @Patch('experts/:id/valider-modification')
  validerModificationExpert(@Param('id') id: number) {
    return this.adminService.validerModificationExpert(id);
  }

  @Patch('experts/:id/refuser-modification')
  refuserModificationExpert(@Param('id') id: number) {
    return this.adminService.refuserModificationExpert(id);
  }

  // ==================== STARTUPS ====================
  @Get('startups')
  getAllStartups() {
    return this.adminService.getAllStartups();
  }

  @Get('startups/attente')
  getStartupEnAttente() {
    return this.adminService.getStartupEnAttente();
  }

  @Patch('startups/:id/valider')
  validerStartup(@Param('id') id: number) {
    return this.adminService.validerStartup(id);
  }

  @Patch('startups/:id/refuser')
  refuserStartup(@Param('id') id: number) {
    return this.adminService.refuserStartup(id);
  }

  // ==================== STATS ====================
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // ==================== BLOG (ARTICLES) ====================
  @Get('articles/all')
  async getAllArticles() {
    return this.adminService.getAllArticlesAdmin();
  }

  @Get('articles/:id')
  async getArticleById(@Param('id') id: number) {
    return this.adminService.findArticleById(id);
  }

  @Post('articles/create')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage: articleStorage }))
  async createArticle(
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.adminService.createArticle(body, imageFile, pdfFile);
  }

  @Put('articles/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage: articleStorage }))
  async updateArticle(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.adminService.updateArticle(id, body, imageFile, pdfFile);
  }

  @Patch('articles/:id/publier')
  async publierArticle(@Param('id') id: number) {
    return this.adminService.updateArticleStatut(id, 'publie');
  }

  @Patch('articles/:id/archiver')
  async archiverArticle(@Param('id') id: number) {
    return this.adminService.updateArticleStatut(id, 'archive');
  }

  @Delete('articles/:id')
  async deleteArticle(@Param('id') id: number) {
    return this.adminService.deleteArticle(id);
  }

  // ==================== MÉDIAS (VIDÉOS) ====================
  @Get('medias/all')
  async getAllMedias() {
    return this.adminService.getAllMediasAdmin();
  }

  @Get('medias/:id')
  async getMediaById(@Param('id') id: number) {
    return this.adminService.getMediaById(id);
  }

  @Post('medias/create')
  @UseInterceptors(FileInterceptor('miniature_file', { storage: mediaStorage }))
  async createMedia(@Body() body: any, @UploadedFile() miniatureFile: Express.Multer.File) {
    return this.adminService.createMedia(body, miniatureFile);
  }

  @Put('medias/:id')
  @UseInterceptors(FileInterceptor('miniature_file', { storage: mediaStorage }))
  async updateMedia(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() miniatureFile: Express.Multer.File,
  ) {
    return this.adminService.updateMedia(id, body, miniatureFile);
  }

  @Delete('medias/:id')
  async deleteMedia(@Param('id') id: number) {
    return this.adminService.deleteMedia(id);
  }

  // ==================== PODCASTS ====================
  @Get('podcasts/all')
  async getAllPodcasts() {
    return this.adminService.getAllPodcastsAdmin();
  }

  @Get('podcasts/:id')
  async getPodcastById(@Param('id') id: number) {
    return this.adminService.getPodcastById(id);
  }
// src/admin/admin.controller.ts
@Post('podcasts/create')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'video_file', maxCount: 1 },
      { name: 'image_file', maxCount: 1 },
    ],
    { storage: podcastStorage, fileFilter: podcastFileFilter, limits: { fileSize: 500 * 1024 * 1024 } },
  ),
)
async createPodcast(
  @Body() dto: CreatePodcastDto,
  @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
) {
  const video = files?.video_file?.[0];
  const image = files?.image_file?.[0];
  
  // ✅ Vérification : soit un fichier, soit une URL
  if (!video && !dto.url_audio) {
    throw new BadRequestException('Vous devez fournir soit un fichier vidéo (MP4), soit une URL externe (YouTube, Vimeo, etc.)');
  }
  
  return this.adminService.createPodcast(dto, video, image);
}
  
  @Put('podcasts/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, fileFilter: podcastFileFilter, limits: { fileSize: 200 * 1024 * 1024 } },
    ),
  )
  async updatePodcast(
    @Param('id') id: number,
    @Body() dto: UpdatePodcastDto,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    const video = files?.video_file?.[0];
    const image = files?.image_file?.[0];
    return this.adminService.updatePodcast(id, dto, video, image);
  }

  @Patch('podcasts/:id/statut')
  async updatePodcastStatut(
    @Param('id') id: number,
    @Body('statut') statut: 'en_attente' | 'publie' | 'refuse',
  ) {
    return this.adminService.updatePodcastStatut(id, statut);
  }

  @Delete('podcasts/:id')
  async deletePodcast(@Param('id') id: number) {
    return this.adminService.deletePodcast(id);
  }

  // ==================== VALIDATION ADMIN POUR NOUVEAUX COMPTES ====================
  @Get('pending-users')
  async getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Post('validate-user/:id')
  async validateUserByAdmin(@Param('id') id: number) {
    return this.adminService.validateUserByAdmin(id);
  }

  @Post('reject-user/:id')
  async rejectUserByAdmin(@Param('id') id: number) {
    return this.adminService.rejectUserByAdmin(id);
  }
}