import * as fs from 'node:fs';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';

export default class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
    const folderPath = `${configService.get<string>('MULTER_DEST')}/${folderName}`;
    fs.writeFile(
      folderPath + generatedSingleFileName,
      singleFile.buffer,
      (err) => {
        if (err) {
          throw new HttpException(err, 500);
        }
      },
    );
    return generatedSingleFileName;
  }
}
