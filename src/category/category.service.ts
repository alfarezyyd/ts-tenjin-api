import { HttpException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { CategoryValidation } from './category.validation';
import { v4 as uuid } from 'uuid';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    logoFile: Express.Multer.File,
    createCategoryDto: CreateCategoryDto,
  ) {
    await this.validationService.validate(
      CategoryValidation.SAVE,
      createCategoryDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const generatedLogoFileName = `${uuid()}-${logoFile.originalname}`;
      const folderPath = `${this.configService.get<string>('MULTER_DEST')}/logo-icon`;
      fs.writeFile(
        folderPath + generatedLogoFileName,
        logoFile.buffer,
        (err) => {
          if (err) {
            throw new HttpException(err, 500);
          }
        },
      );
      prismaTransaction.category.create({
        data: {
          logo: generatedLogoFileName,
          ...createCategoryDto,
        },
      });
    });
    return 'Success! new category has been created';
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
