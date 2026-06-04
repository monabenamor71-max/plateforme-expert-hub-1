import { Controller, Post, Get, Patch, Delete, Put, Body, Param, Request as NestRequest, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TemoignagesService } from './temoignages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number; role?: string };
}

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly temoignagesService: TemoignagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { texte: string; note?: number }, @NestRequest() req: RequestWithUser) {
    const dto = { 
      user_id: req.user.id, 
      texte: body.texte,
      note: body.note || 5
    };
    return this.temoignagesService.create(dto);
  }

  @Get('publics')
  async getPublics() {
    return this.temoignagesService.getPublics();
  }

  @Get('mes-temoignages')
  @UseGuards(JwtAuthGuard)
  async getMesTemoignages(@NestRequest() req: RequestWithUser) {
    return this.temoignagesService.getMesTemoignages(req.user.id);
  }

  @Get('all')
  async getAll() {
    return this.temoignagesService.getAll();
  }

  @Patch(':id/valider')
  async valider(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.valider(id);
  }

  @Patch(':id/refuser')
  async refuser(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.refuser(id);
  }

  // AJOUT: MODIFIER UN TÉMOIGNAGE (PUT)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { texte: string; note: number },
    @NestRequest() req: RequestWithUser
  ) {
    return this.temoignagesService.update(id, req.user.id, {
      texte: body.texte,
      note: body.note,
    });
  }

  // SUPPRIMER - CORRIGÉ (1 argument seulement)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.supprimer(id);
  }
}