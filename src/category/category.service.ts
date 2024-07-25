import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { CategoryValidation } from './category.validation';
import { v4 as uuid } from 'uuid';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';
import { Category } from '@prisma/client';

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
      const generatedLogoFileName = this.handleSaveFile(logoFile);
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

  async update(
    categoryId: number,
    logoFile: Express.Multer.File,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const validatedUpdateCategoryDto = await this.validationService.validate(
      CategoryValidation.SAVE,
      updateCategoryDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const categoryPrisma: Category = await prismaTransaction.category
        .findUniqueOrThrow({
          where: {
            id: categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with ID ${categoryId} not found`,
          );
        });
      fs.unlink(
        `${this.configService.get<string>('MULTER_DEST')}/logo-icon/${categoryPrisma.logo}`,
        () => {
          throw new HttpException('Error when trying to write icon', 500);
        },
      );
      const generatedLogoFileName = this.handleSaveFile(logoFile);
      await prismaTransaction.category.update({
        where: {
          id: categoryPrisma.id,
        },
        data: {
          logo: generatedLogoFileName,
          ...validatedUpdateCategoryDto,
        },
      });
    });
    return `This action updates a #${categoryId} category`;
  }

  async remove(categoryId: number) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const categoryPrisma: Category = await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with ID ${categoryId} not found`,
          );
        });
      fs.unlink(
        `${this.configService.get<string>('MULTER_DEST')}/logo-icon/${categoryPrisma.logo}`,
        () => {
          throw new HttpException('Error when trying to write icon', 500);
        },
      );
      prismaTransaction.category.delete({
        where: {
          id: categoryId,
        },
      });
    });
    return `Success! category has been deleted`;
  }

  private handleSaveFile(logoFile: Express.Multer.File) {
    const generatedLogoFileName = `${uuid()}-${logoFile.originalname}`;
    const folderPath = `${this.configService.get<string>('MULTER_DEST')}/logo-icon`;
    fs.writeFile(folderPath + generatedLogoFileName, logoFile.buffer, (err) => {
      if (err) {
        throw new HttpException(err, 500);
      }
    });
    return generatedLogoFileName;
  }
}
