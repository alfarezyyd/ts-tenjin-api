import * as fs from 'node:fs';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as fsPromises from 'fs/promises';
import * as crypto from 'crypto';

export default class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const generatedSingleFileName = `${uuid()}-${singleFile.originalname}`;
    const folderPath = `${configService.get<string>('MULTER_DEST')}/${folderName}/`;
    await fsPromises.mkdir(folderPath, { recursive: true });
    console.log(singleFile);
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

  static async compareImagesFromUpload(
    firstImagePath: string,
    secondImageFile: Express.Multer.File,
  ) {
    const firstImage = await fsPromises.readFile(firstImagePath);

    const firstImageBase64 = firstImage.toString('base64');
    const secondImageBase64 = secondImageFile.buffer.toString('base64');

    return firstImageBase64 === secondImageBase64;
  }

  static async generateOneTimePassword(
    lengthOfPassword: number = 6,
  ): Promise<string> {
    const max = Math.pow(10, lengthOfPassword);
    const randomNumber = crypto.randomInt(0, max);
    return randomNumber.toString().padStart(lengthOfPassword, '0');
  }
}
