import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body(ValidationPipe) dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.newsletterService.getAll();
  }

  // Vérifier si l'utilisateur connecté (expert ou startup) est abonné
  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkSubscription(@Request() req: any) {
    const userId = req.user.id;
    const isSubscribed = await this.newsletterService.isSubscribedByUserId(userId);
    return { subscribed: isSubscribed };
  }
}