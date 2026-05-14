// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { Blog } from '../blog/blog.entity';
import { MailModule } from '../mail/mail.module';
import { MediaModule } from '../media/media.module';
import { PodcastModule } from '../podcast/podcast.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expert, Startup, Blog]),
    MailModule,
    MediaModule,
    PodcastModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // ✅ AJOUTER CETTE LIGNE - Exporte AdminService
})
export class AdminModule {}