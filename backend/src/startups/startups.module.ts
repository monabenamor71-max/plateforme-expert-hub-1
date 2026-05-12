// src/startups/startups.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { StartupsService } from './startups.service';
import { StartupsController } from './startups.controller';
import { Startup } from '../user/startup.entity';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Startup, User, Expert]),
    MulterModule.register({
      dest: path.join(process.cwd(), 'uploads', 'photos'),
    }),
  ],
  controllers: [StartupsController],
  providers: [StartupsService],
  exports: [StartupsService],
})
export class StartupsModule {}