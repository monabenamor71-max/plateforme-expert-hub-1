import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { News } from './news.entity';
import { MailModule } from '../mail/mail.module';
import { NewsletterModule } from '../newsletter/newsletter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([News]),
    MailModule,
    forwardRef(() => NewsletterModule),
  ],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}