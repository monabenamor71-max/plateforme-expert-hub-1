// src/formations/formations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formation } from './formation.entity';
import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';
import { MailModule } from '../mail/mail.module';
import { Expert } from '../user/expert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Formation, Expert]),
    MailModule,  // ← CRUCIAL : MailModule doit être importé
  ],
  controllers: [FormationsController],
  providers: [FormationsService],
  exports: [FormationsService],
})
export class FormationsModule {}