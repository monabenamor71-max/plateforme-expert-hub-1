// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const uploadDirs = [
    './uploads', './uploads/articles-img', './uploads/articles-pdf',
    './uploads/videos-miniatures', './uploads/podcasts-audio', './uploads/podcasts-images',
    './uploads/photos', './uploads/cv', './uploads/portfolio', './uploads/formations', './logs',
  ];
  uploadDirs.forEach(dir => { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); });

  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, stack }) => {
            return `${timestamp} [${context || 'App'}] ${level}: ${message}${stack ? `\n${stack}` : ''}`;
          }),
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: winstonLogger });

  // 🚀 Augmentation de la limite pour accepter les vidéos MP4 jusqu'à 200 Mo
  app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();