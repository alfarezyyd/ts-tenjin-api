import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import ElasticSearchService from './elastic-search.service';
import { MulterService } from './multer.service';
import { AxiosService } from './axios.service';
import { MidtransService } from './midtrans.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(winston.format.json()),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // use SSL
          service: configService.get<string>('EMAIL_HOST'),
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
      }),
    }),
    MulterModule.registerAsync({
      useClass: MulterService,
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: ElasticSearchService,
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: AxiosService,
    }),
  ],
  providers: [PrismaService, ValidationService, MidtransService],
  exports: [
    PrismaService,
    ValidationService,
    MulterModule,
    ElasticsearchModule,
    HttpModule,
    MidtransService,
  ],
})
export class CommonModule {}
