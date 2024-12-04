import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TagValidation } from './tag.validation';
import { Tag } from '@prisma/client';

@Injectable()
export class TagService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTagDto: CreateTagDto) {
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

      await prismaTransaction.tag.create({
        data: {
          ...validatedCreateTagDto,
        },
      });
    });
    return 'Success! new tag has been created';
  }

  async findAll(): Promise<Tag[]> {
    return this.prismaService.tag.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  async update(tagId: number, updateTagDto: UpdateTagDto) {
    const validateUpdateTagDto = this.validationService.validate(
      TagValidation.SAVE,
      updateTagDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.tag
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

      await prismaTransaction.tag.update({
        data: {
          name: validateUpdateTagDto.name,
          categoryId: Number(validateUpdateTagDto.categoryId),
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
      await prismaTransaction.tag
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
    });
    return `Success! tag with tagId ${tagId} removed`;
  }
}
