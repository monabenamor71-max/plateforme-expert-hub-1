import { Controller, Post, Get, Patch, Delete, Body, Param, Request as NestRequest, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TemoignagesService } from './temoignages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly temoignagesService: TemoignagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { texte: string }, @NestRequest() req: RequestWithUser) {
    const dto = { user_id: req.user.id, texte: body.texte };
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

  @Delete(':id')
  async supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.supprimer(id);
  }
}