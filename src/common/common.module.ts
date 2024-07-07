import { Module } from '@nestjs/common';
import PrismaService from './prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import ValidationService from './validation.service';
import { MulterModule } from '@nestjs/platform-express';
import { MulterService } from './multer.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import ElasticSearchService from './elastic-search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AxiosService } from './axios.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
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
  providers: [
    PrismaService,
    ValidationService,
    RedisService,
    {
      provide: 'RedisClient',
      useClass: RedisService,
    },
  ],
  exports: [
    PrismaService,
    ValidationService,
    MulterModule,
    ElasticsearchModule,
    HttpModule,
  ],
})
export class CommonModule {}
