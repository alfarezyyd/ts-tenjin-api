import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class MulterService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const path = `public/assets/images/uploads/${req.params.storeId}/${req.body.sku}/`;
          console.log(path);
          fs.mkdirSync(path, { recursive: true });
          callback(null, path);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.originalname +
              '-' +
              uniqueSuffix +
              path.extname(file.originalname),
          );
        },
      }),
    };
  }
}
