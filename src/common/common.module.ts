import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ValidationService } from './validation.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { MulterService } from './multer.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useClass: MulterService,
    }),
  ],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService, MulterModule],
})
export class CommonModule {}
