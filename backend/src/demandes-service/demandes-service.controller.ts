import {
  Controller, Get, Post, Patch, Put, Delete,
  Body, Param, UseGuards, Req, ValidationPipe, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { DemandesServiceService } from './demandes-service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { NotifierExpertsDto } from './dto/notifier-experts.dto';
import { SoumettreDevisDto } from './dto/soumettre-devis.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: number };
}

@Controller('demandes-service')
export class DemandesServiceController {
  constructor(private readonly service: DemandesServiceService) {}

  // ==================== ADMIN ====================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.service.updateStatut(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.service.supprimer(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/notifier-experts')
  async notifierExperts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    let expertIds: number[];
    if (Array.isArray(body)) expertIds = body;
    else if (body && body.expert_ids && Array.isArray(body.expert_ids)) expertIds = body.expert_ids;
    else throw new BadRequestException('Le tableau d\'IDs des experts est requis');
    const dto: NotifierExpertsDto = { expert_ids: expertIds };
    return this.service.notifierExperts(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/experts-acceptes')
  getExpertsAcceptes(@Param('id', ParseIntPipe) id: number) {
    return this.service.getExpertsAcceptes(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('formation/:demandeId/accept')
  acceptFormationDemande(@Param('demandeId', ParseIntPipe) demandeId: number) {
    return this.service.acceptFormationDemande(demandeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('formation/:demandeId/reject')
  rejectFormationDemande(@Param('demandeId', ParseIntPipe) demandeId: number) {
    return this.service.rejectFormationDemande(demandeId);
  }

  // ==================== STARTUPS ====================
  @UseGuards(JwtAuthGuard)
  @Get('mes-demandes')
  getMesDemandes(@Req() req: RequestWithUser) {
    return this.service.getMesDemandes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(ValidationPipe) dto: CreateDemandeDto, @Req() req: RequestWithUser) {
    return this.service.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('formation/:formationId')
  createFormationDemande(
    @Param('formationId', ParseIntPipe) formationId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.service.createFormationDemande(req.user.id, formationId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateDemande(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateDemandeDto,
    @Req() req: RequestWithUser,
  ) {
    return this.service.updateDemande(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('client/:id')
  deleteDemande(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.service.deleteDemande(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('startup')
  @Patch(':demandeId/accepter-devis/:devisId')
  async accepterDevis(
    @Param('devisId', ParseIntPipe) devisId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.service.accepterDevis(req.user.id, devisId);
  }

  // ==================== EXPERTS ====================
  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Get('expert/assignees')
  async getDemandesAssignees(@Req() req: RequestWithUser) {
    return this.service.getDemandesAssignees(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Get('expert/notifications')
  async getNotifications(@Req() req: RequestWithUser) {
    return this.service.getNotificationsForExpert(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Get('expert/visible')
  async getVisibleDemandes(@Req() req: RequestWithUser) {
    return this.service.getVisibleDemandesForExpert(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Put(':id/accepter')
  async accepterMission(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.service.accepterMission(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Put(':id/refuser')
  async refuserMission(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.service.refuserMission(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('expert')
  @Post(':id/soumettre-devis')
  async soumettreDevis(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: SoumettreDevisDto,
    @Req() req: RequestWithUser,
  ) {
    return this.service.soumettreDevis(req.user.id, id, dto);
  }
}