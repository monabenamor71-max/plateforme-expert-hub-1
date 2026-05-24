// src/podcast/podcast.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './podcast.entity';
import { PodcastService } from './podcast.service';
import { PodcastController } from './podcast.controller';
import { Expert } from '../user/expert.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Podcast, Expert]),
    MailModule,
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [PodcastService],
})
export class PodcastModule {}