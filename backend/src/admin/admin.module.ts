import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { Blog } from '../blog/blog.entity';
import { MailModule } from '../mail/mail.module';
import { MediaModule } from '../media/media.module';
import { PodcastModule } from '../podcast/podcast.module';
import { CvAnalysisService } from './services/cv-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expert, Startup, Blog]),
    HttpModule,
    MailModule,
    MediaModule,
    PodcastModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, CvAnalysisService],
  exports: [AdminService],
})
export class AdminModule {}