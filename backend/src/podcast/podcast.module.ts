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
    MailModule,  // ← IMPORTANT: MailModule doit être importé
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [PodcastService],
})
export class PodcastModule {}