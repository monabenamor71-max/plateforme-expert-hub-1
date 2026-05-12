import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRendezVousDto, UpdateRendezVousDto, AccepterPropositionDto } from './dto/rendez-vous.dto';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number };
}

@Controller('rendez-vous')
export class RendezVousController {
  constructor(private rdvService: RendezVousService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(ValidationPipe) createDto: CreateRendezVousDto, @Request() req: RequestWithUser) {
    return this.rdvService.createRdv(createDto, req.user.id);
  }

  @Get('expert')
  @UseGuards(JwtAuthGuard)
  getByExpert(@Request() req: RequestWithUser) {
    return this.rdvService.getByExpert(req.user.id);
  }

  @Get('startup')
  @UseGuards(JwtAuthGuard)
  getByClient(@Request() req: RequestWithUser) {
    return this.rdvService.getByClient(req.user.id);
  }

  @Put(':id/confirmer')
  @UseGuards(JwtAuthGuard)
  confirmer(@Param('id', ParseIntPipe) id: number) {
    return this.rdvService.confirmer(id);
  }

  @Put(':id/annuler')
  @UseGuards(JwtAuthGuard)
  annuler(@Param('id', ParseIntPipe) id: number) {
    return this.rdvService.annuler(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateRendezVousDto,
    @Request() req: RequestWithUser,
  ) {
    return this.rdvService.updateRdv(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: RequestWithUser) {
    return this.rdvService.deleteRdv(id, req.user.id);
  }

  @Put(':id/accepter-proposition')
  @UseGuards(JwtAuthGuard)
  async accepterProposition(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AccepterPropositionDto,
    @Request() req: RequestWithUser,
  ) {
    return this.rdvService.accepterProposition(id, dto.nouvelle_date, req.user.id);
  }
}