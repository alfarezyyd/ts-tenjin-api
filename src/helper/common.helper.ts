import * as fs from 'node:fs';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as fsPromises from 'fs/promises';

export default class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
    const folderPath = `${configService.get<string>('MULTER_DEST')}/${folderName}/`;
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

  static async compareImages(firstImagePath: string, secondImagePath: string) {
    const firstImage = await fsPromises.readFile(firstImagePath);
    const secondImage = await fsPromises.readFile(secondImagePath);

    const firstImageBase64 = firstImage.toString('base64');
    const secondImageBase64 = secondImage.toString('base64');

    return firstImageBase64 === secondImageBase64;
  }
}
