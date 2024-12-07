import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as fsPromises from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'node:path';

export default class CommonHelper {
  static async handleSaveFile(
    configService: ConfigService,
    singleFile: Express.Multer.File,
    folderName: string,
  ) {
    const multerDest = configService.get<string>('MULTER_DEST');
    // Gunakan path.join untuk memastikan path relatif atau absolut
    const folderPath = path.join(
      process.cwd(), // Root proyek
      multerDest,
      folderName,
    );

    const generatedSingleFileName = `${uuid()}-${await this.sanitizeFileName(singleFile.originalname)}`;
    await fsPromises.mkdir(folderPath, { recursive: true });

    const fullPath = path.join(folderPath, generatedSingleFileName);

    await fsPromises.writeFile(fullPath, singleFile.buffer);
    return generatedSingleFileName;
  }

  static async compareImagesFromUpload(
    firstImagePath: string,
    secondImageFile: Express.Multer.File,
  ) {
    if (firstImagePath === null) {
      return true;
    }
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

  static async sanitizeFileName(fileName) {
    // Mengganti spasi dengan tanda hubung dan menghapus karakter yang tidak valid
    return fileName
      .replace(/\s+/g, '-') // Ganti spasi dengan -
      .replace(/[^\w\-\.]+/g, '') // Hapus karakter selain huruf, angka, dan tanda - dan .
      .toLowerCase(); // Ubah menjadi lowercase
  }
}
