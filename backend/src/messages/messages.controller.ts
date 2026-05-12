import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    role?: string;
  };
}

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async send(@Body(ValidationPipe) dto: SendMessageDto, @Request() req: RequestWithUser) {
    this.logger.log(`📨 POST /messages - sender=${req.user.id}, receiver=${dto.receiver_id}`);
    return this.messagesService.send(req.user.id, dto);
  }

  @Get('mes-messages')
  @UseGuards(JwtAuthGuard)
  async getMyMessages(@Request() req: RequestWithUser) {
    this.logger.log(`📞 GET /messages/mes-messages - user=${req.user.id}`);
    return this.messagesService.getMyMessages(req.user.id);
  }

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  async getConversation(@Request() req: RequestWithUser, @Param('userId', ParseIntPipe) userId: number) {
    this.logger.log(`📞 GET /messages/conversation/${userId} - currentUser=${req.user.id}`);
    return this.messagesService.getConversation(req.user.id, userId);
  }

  @Get('non-lus')
  @UseGuards(JwtAuthGuard)
  getUnread(@Request() req: RequestWithUser) {
    return this.messagesService.getUnread(req.user.id);
  }

  @Post('lire/:senderId')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Request() req: RequestWithUser, @Param('senderId', ParseIntPipe) senderId: number) {
    return this.messagesService.markAsRead(req.user.id, senderId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMessage(@Param('id', ParseIntPipe) id: number, @Request() req: RequestWithUser) {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    return this.messagesService.deleteMessage(id, userId, isAdmin);
  }
}