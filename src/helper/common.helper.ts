import * as fs from 'node:fs';
import * as path from 'node:path';

export default class CommonHelper {
  static async slugifyProductName(productName: string): Promise<string> {
    return productName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }

  static async deleteFolderRecursive(folderPath: string) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file, index) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Memeriksa apakah itu direktori
          this.deleteFolderRecursive(curPath); // Memanggil fungsi rekursif untuk menghapus subfolder
        } else {
          // Menghapus file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath); // Menghapus folder setelah file dan subfolder di dalamnya dihapus
    }
  }

  static generateFileName(multerFile: Express.Multer.File) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return (
      multerFile.originalname +
      '-' +
      uniqueSuffix +
      path.extname(multerFile.originalname)
    );
  }
}
