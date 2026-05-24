import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';   // ← IMPORTANT
import { ExpertsController } from './experts.controller';
import { ExpertsService } from './experts.service';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expert, User]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    MailModule,
  ],
  controllers: [ExpertsController],
  providers: [ExpertsService],
  exports: [ExpertsService],
})
export class ExpertsModule {}