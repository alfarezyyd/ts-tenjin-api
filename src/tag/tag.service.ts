import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TagValidation } from './tag.validation';
import { Tag } from '@prisma/client';
import CommonHelper from '../helper/common.helper';
import * as fs from 'node:fs';

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
            id: Number(createTagDto.categoryId),
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
      await prismaTransaction.tag.create({
        data: {
          ...validatedCreateTagDto,
          icon: iconFileName,
        },
      });
    });
    return 'Success! new tag has been created';
  }

  findAll() {
    return `This action returns all tag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  async update(
    tagId: number,
    iconFile: Express.Multer.File,
    updateTagDto: UpdateTagDto,
  ) {
    const validateUpdateTagDto = this.validationService.validate(
      TagValidation.SAVE,
      updateTagDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const tagPrisma: Tag = await prismaTransaction.tag
        .findFirstOrThrow({
          where: {
            id: tagId,
          },
        })
        .catch(() => {
          throw new NotFoundException(`Tag with tagId ${tagId} not found`);
        });
      await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: validateUpdateTagDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${validateUpdateTagDto.categoryId} not found`,
          );
        });
      const isImageSame = await CommonHelper.compareImagesFromUpload(
        `${this.configService.get<string>('MULTER_DEST')}/tag-icon/${tagPrisma.icon}`,
        iconFile,
      );
      let newGeneratedSingleFileName = null;
      if (!isImageSame) {
        fs.unlinkSync(
          `${this.configService.get<string>('MULTER_DEST')}/tag-icon/${tagPrisma.icon}`,
        );
        newGeneratedSingleFileName = await CommonHelper.handleSaveFile(
          this.configService,
          iconFile,
          'tag-icon',
        );
      }
      await prismaTransaction.tag.update({
        data: {
          ...validateUpdateTagDto,
          icon: newGeneratedSingleFileName ?? tagPrisma.icon,
        },
        where: {
          id: tagId,
        },
      });
    });
    return `Success! tag with tagId ${tagId} successfully updated`;
  }

  async remove(tagId: number) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const tagPrisma: Tag = await prismaTransaction.tag
        .findFirstOrThrow({
          where: {
            id: tagId,
          },
        })
        .catch(() => {
          throw new NotFoundException(`Tag with tagId ${tagId} not found`);
        });
      await prismaTransaction.tag.delete({
        where: {
          id: tagId,
        },
      });
      fs.unlinkSync(
        `${this.configService.get<string>('MULTER_DEST')}/tag-icon/${tagPrisma.icon}`,
      );
    });
    return `Success! tag with tagId ${tagId} removed`;
  }
}
