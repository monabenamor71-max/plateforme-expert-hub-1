import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { ExpertsModule } from './experts/experts.module';
import { StartupsModule } from './startups/startups.module';
import { RendezVousModule } from './rendez-vous/rendez-vous.module';
import { MessagesModule } from './messages/messages.module';
import { TemoignagesModule } from './temoignages/temoignages.module';
import { DevisModule } from './devis/devis.module';
import { HistoireModule } from './histoire/histoire.module';
import { DemandesServiceModule } from './demandes-service/demandes-service.module';
import { ServicesPlateformeModule } from './services-plateforme/services-plateforme.module';
import { FormationsModule } from './formations/formations.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { BlogModule } from './blog/blog.module';
import { MediaModule } from './media/media.module';
import { PodcastModule } from './podcast/podcast.module';
import { NewsModule } from './news/news.module'; // ← AJOUTER

// Entities
import { User } from './user/user.entity';
import { Expert } from './user/expert.entity';
import { Startup } from './user/startup.entity';
import { Rendezvous } from './rendez-vous/rendezvous.entity';
import { Message } from './messages/message.entity';
import { Temoignage } from './temoignages/temoignage.entity';
import { Histoire } from './histoire/histoire.entity';
import { DemandeService } from './demandes-service/demande-service.entity';
import { ServicePlateforme } from './services-plateforme/service-plateforme.entity';
import { ContactMessage } from './contact/contact-message.entity';
import { ContactConfig } from './contact/contact-config.entity';
import { Newsletter } from './newsletter/newsletter.entity';
import { Formation } from './formations/formation.entity';
import { Devis } from './devis/devis.entity';
import { Blog } from './blog/blog.entity';
import { Media } from './media/media.entity';
import { Podcast } from './podcast/podcast.entity';
import { News } from './news/news.entity'; // ← AJOUTER

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'consulting_platform',
      entities: [
        User, Expert, Startup, Rendezvous,
        Message, Temoignage, Histoire, DemandeService,
        ServicePlateforme, ContactMessage, ContactConfig, Newsletter,
        Formation, Devis, Blog, Media, Podcast,
        News, // ← AJOUTER
      ],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    MailModule,
    AdminModule,
    ExpertsModule,
    StartupsModule,
    RendezVousModule,
    MessagesModule,
    TemoignagesModule,
    DevisModule,
    HistoireModule,
    DemandesServiceModule,
    ServicesPlateformeModule,
    FormationsModule,
    ContactModule,
    NewsletterModule,
    BlogModule,
    MediaModule,
    PodcastModule,
    NewsModule, // ← AJOUTER
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}