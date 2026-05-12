import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Query, UseGuards } from '@nestjs/common';
import { ServicesPlateformeService } from './services-plateforme.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: number };
}

@Controller('services-plateforme')
export class ServicesPlateformeController {
  constructor(private svc: ServicesPlateformeService) {}

  @Get('public')
  getPublic(@Query('type') type?: string) {
    return this.svc.getPublic(type);
  }

  @Get('public/:id')
  getById(@Param('id') id: string) {
    return this.svc.getById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.svc.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/en-attente')
  getEnAttente() {
    return this.svc.getEnAttente();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/create')
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/publier')
  publier(@Param('id') id: string) {
    return this.svc.publier(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/refuser')
  refuser(@Param('id') id: string, @Body() body: any) {
    return this.svc.refuser(+id, body?.commentaire);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/archiver')
  archiver(@Param('id') id: string) {
    return this.svc.archiver(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  supprimer(@Param('id') id: string) {
    return this.svc.supprimer(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('expert/proposer')
  proposer(@Req() req: RequestWithUser, @Body() body: any) {
    return this.svc.proposer(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('expert/mes-formations')
  mesFormations(@Req() req: RequestWithUser) {
    return this.svc.getMesFormations(req.user.id);
  }
}