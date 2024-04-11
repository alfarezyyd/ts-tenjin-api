import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { Injectable } from '@nestjs/common';
import { memoryStorage } from 'multer';

@Injectable()
export class MulterService implements MulterOptionsFactory {
  constructor() {}

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: memoryStorage(),
    };
  }
}
