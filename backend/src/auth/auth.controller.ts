// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterExpertDto } from './dto/register-expert.dto';
import { RegisterStartupDto } from './dto/register-startup.dto';
import { LoginDto } from './dto/login.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response, Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/expert')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'cv', maxCount: 1 },
        { name: 'portfolio', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req: ExpressRequest, file: Express.Multer.File, cb) => {
            let folder = './uploads';
            if (file.fieldname === 'photo') folder = './uploads/photos';
            else if (file.fieldname === 'cv') folder = './uploads/cv';
            else if (file.fieldname === 'portfolio') folder = './uploads/portfolio';
            cb(null, folder);
          },
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, filename);
          },
        }),
      },
    ),
  )
  async registerExpert(
    @Body() dto: RegisterExpertDto,
    @UploadedFiles() files: { photo?: Express.Multer.File[]; cv?: Express.Multer.File[]; portfolio?: Express.Multer.File[] },
  ) {
    const photoPath = files.photo?.[0]?.path;
    const cvPath = files.cv?.[0]?.path;
    const portfolioPath = files.portfolio?.[0]?.path;
    return this.authService.registerExpert(dto, photoPath, cvPath, portfolioPath);
  }

  @Post('register/startup')
  async registerStartup(@Body() dto: RegisterStartupDto) {
    return this.authService.registerStartup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email requis');
    return this.authService.forgotPassword(email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string; newPassword: string }) {
    const { email, code, newPassword } = body;
    if (!email || !code || !newPassword) {
      throw new BadRequestException('Email, code et nouveau mot de passe requis');
    }
    return this.authService.resetPasswordWithCode(email, code, newPassword);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    console.log('=== CONFIRMATION EMAIL ===');
    console.log('Token reçu:', token);
    
    if (!token) {
      return res.status(400).json({ message: 'Token de confirmation manquant' });
    }
    
    try {
      const result = await this.authService.confirmEmail(token);
      return res.status(200).json({ message: result.message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lien de confirmation invalide ou expiré';
      return res.status(400).json({ message });
    }
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email requis');
    const user = await this.authService.findUserByEmail(email);
    return { exists: !!user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: ExpressRequest) {
    const userId = (req.user as { id?: number })?.id;
    if (!userId) throw new BadRequestException('Utilisateur non authentifié');
    const user = await this.authService.getUserById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom,
      telephone: user.telephone,
      statut: user.statut,
    };
  }
}