import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { TagValidation } from './tag.validation';
import { create } from 'axios';
import { Category } from '@prisma/client';
import * as fs from 'node:fs';
import CommonHelper from '../helper/common.helper';

@Injectable()
export class TagService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(iconFile: Express.Multer.File, createTagDto: CreateTagDto) {
    const validatedCreateTagDto = this.validationService.validate(
      TagValidation.SAVE,
      createTagDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: createTagDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${createTagDto.categoryId} not found`,
          );
        });
      const iconFileName = await CommonHelper.handleSaveFile(
        this.configService,
        iconFile,
        'tag-icon',
      );
      prismaTransaction.tag.create({
        data: {
          ...validatedCreateTagDto,
          logo: iconFileName,
        },
      });
    });
    return 'This action adds a new tag';
  }

  findAll() {
    return `This action returns all tag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }

  private handleSaveFile(iconFile: Express.Multer.File) {
    const generatedLogoFileName = `${uuid()}-${iconFile.originalname}`;
    const folderPath = `${this.configService.get<string>('MULTER_DEST')}/logo-icon`;
    fs.writeFile(folderPath + generatedLogoFileName, iconFile.buffer, (err) => {
      if (err) {
        throw new HttpException(err, 500);
      }
    });
    return generatedLogoFileName;
  }
}
