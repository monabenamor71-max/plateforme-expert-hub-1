import { Controller, Post, Get, Body, Param, Patch, UseGuards, Req, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { DevisService } from './devis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: number };
}

@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: RequestWithUser, @Body(ValidationPipe) dto: CreateDevisDto) {
    return this.devisService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('expert/mes-devis')
  async getMesDevis(@Req() req: RequestWithUser) {
    return this.devisService.findByExpert(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('client/mes-devis')
  async getMesDevisClient(@Req() req: RequestWithUser) {
    return this.devisService.findByClient(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllDevis() {
    return this.devisService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/client-statut')
  async updateStatutClient(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.devisService.updateStatutByClient(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.devisService.updateStatut(id, dto);
  }
}