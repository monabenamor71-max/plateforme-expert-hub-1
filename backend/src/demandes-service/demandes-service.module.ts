import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesServiceService } from './demandes-service.service';
import { DemandesServiceController } from './demandes-service.controller';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';
import { Devis } from '../devis/devis.entity';
import { FormationsModule } from '../formations/formations.module';
import { MailModule } from '../mail/mail.module';  // ← IMPORTER MailModule

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeService, Formation, Expert, Devis]),
    FormationsModule,
    MailModule,  // ← AJOUTER MailModule ici
  ],
  controllers: [DemandesServiceController],
  providers: [DemandesServiceService],
  exports: [DemandesServiceService],
})
export class DemandesServiceModule {}