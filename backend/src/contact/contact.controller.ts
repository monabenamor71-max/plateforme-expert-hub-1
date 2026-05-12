import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactConfigDto } from './dto/update-contact-config.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // si vous avez un guard

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Endpoints publics
  @Get('config')
  async getConfig() {
    return this.contactService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() updateData: UpdateContactConfigDto) {
    return this.contactService.updateConfig(updateData);
  }

  @Post('message')
  async sendMessage(@Body() dto: CreateContactMessageDto) {
    return this.contactService.saveContactMessage(dto);
  }

  @Get('messages')
  async getAllMessages() {
    return this.contactService.getAllMessages();
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('messages/:id/lu')
  async markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(+id);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    return this.contactService.deleteMessage(+id);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('messages/:id/repondre')
  async replyToMessage(@Param('id') id: string, @Body() body: { reponse: string }) {
    return this.contactService.replyToMessage(+id, body.reponse);
  }
}