import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';

import PrismaService from './prisma.service';
import ValidationService from './validation.service';
import ElasticSearchService from './elastic-search.service';
import { RedisService } from './redis.service';
import { MulterService } from './multer.service';
import { AxiosService } from './axios.service';

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
  providers: [PrismaService, ValidationService, RedisService],
  exports: [
    PrismaService,
    ValidationService,
    MulterModule,
    ElasticsearchModule,
    HttpModule,
    RedisService,
  ],
})
export class CommonModule {}
