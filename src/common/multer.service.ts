import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';

@Injectable()
export class MulterService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: memoryStorage(),
    };
  }
}
