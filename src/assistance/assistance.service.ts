import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { AssistanceValidation } from './assistance.validation';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Assistance, Category, Language, Tag } from '@prisma/client';
import * as fs from 'node:fs';
import { ResponseAssistanceDto } from './dto/response-assistance.dto';

@Injectable({ scope: Scope.REQUEST })
export class AssistanceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}
  async create(): Promise<{
    languages: Language[];
    categories: Category[];
    tags: Tag[];
  }> {
    const groupedData = {
      languages: [],
      tags: [],
      categories: [],
    };
    await this.prismaService.$transaction(async (prismaTransaction) => {
      groupedData['languages'] = await prismaTransaction.language.findMany();
      groupedData['categories'] = await prismaTransaction.category.findMany();
      groupedData['tags'] = await prismaTransaction.tag.findMany();
    });
    return groupedData;
  }

  async store(createAssistanceDto: CreateAssistanceDto) {
    const validatedCreateAssistanceDto = this.validationService.validate(
      AssistanceValidation.SAVE,
      createAssistanceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: this.expressRequest['user']['mentorId'],
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Mentor with mentorId ${this.expressRequest['user']['mentorId']} not found`,
          );
        });
      await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: createAssistanceDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${createAssistanceDto.categoryId} not found`,
          );
        });
      const allTagPrisma: Tag[] = await prismaTransaction.tag.findMany({
        where: {
          id: {
            in: [...validatedCreateAssistanceDto.tagId],
          },
        },
      });
      if (allTagPrisma.length != validatedCreateAssistanceDto.tagId.size) {
        throw new NotFoundException(`Some tagId not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tagId, categoryId, language, ...prismaPayload } =
        validatedCreateAssistanceDto;
      const newAssistancePrisma: Assistance =
        await prismaTransaction.assistance.create({
          data: {
            ...prismaPayload,
            format: 'INDIVIDUAL',
            mentor: {
              connect: {
                id: this.expressRequest['user']['mentorId'],
              },
            },
            category: {
              connect: {
                id: validatedCreateAssistanceDto.categoryId,
              },
            },
          },
        });
      const assistanceTagsInsertPayload = Array.from(
        validatedCreateAssistanceDto.tagId,
      ).map((value) => ({
        assistanceId: newAssistancePrisma.id,
        tagId: value as number,
      }));
      await prismaTransaction.assistanceTags.createMany({
        data: assistanceTagsInsertPayload,
      });
    });
    return 'Success! new assistance has been created';
  }

  async findAll(): Promise<ResponseAssistanceDto[]> {
    const allAssistantsWithRelationship =
      await this.prismaService.assistance.findMany({
        include: {
          mentor: true,
          category: true,
          AssistanceLanguage: true,
        },
      });
    const allResponseAssistants: ResponseAssistanceDto[] = [];
    for (const assistantWithRelationship of allAssistantsWithRelationship) {
      const { topic, durationMinutes, price, format, isActive } =
        assistantWithRelationship;
      const responseAssistant: ResponseAssistanceDto = {
        id: assistantWithRelationship.id.toString(),
        mentorId: assistantWithRelationship.mentorId.toString(),
        categoryId: assistantWithRelationship['categoryId'].toString(),
        categoryName: assistantWithRelationship['category']['name'],
        topic,
        durationMinutes: durationMinutes.toString(),
        price: price.toString(),
        format,
        isActive,
      };
      allResponseAssistants.push(responseAssistant);
    }
    console.log(allResponseAssistants);
    return allResponseAssistants;
  }

  findOne(id: number) {
    return `This action returns a #${id} assistance`;
  }

  async update(assistanceId: bigint, updateAssistanceDto: UpdateAssistanceDto) {
    const validatedCreateAssistanceDto = this.validationService.validate(
      AssistanceValidation.SAVE,
      updateAssistanceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: this.expressRequest['user']['mentorId'],
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Mentor with mentorId ${this.expressRequest['user']['mentorId']} not found`,
          );
        });
      await prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: updateAssistanceDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${updateAssistanceDto.categoryId} not found`,
          );
        });
      const allTagPrisma: Tag[] = await prismaTransaction.tag.findMany({
        where: {
          id: {
            in: [...validatedCreateAssistanceDto.tagId],
          },
        },
      });
      if (allTagPrisma.length != validatedCreateAssistanceDto.tagId.size) {
        throw new NotFoundException(`Some tagId not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tagId, categoryId, ...prismaPayload } = updateAssistanceDto;
      const updateAssistancePrisma: Assistance =
        await prismaTransaction.assistance.update({
          where: {
            id: assistanceId,
          },
          data: {
            ...prismaPayload,
            format: 'INDIVIDUAL',
            mentor: {
              connect: {
                id: this.expressRequest['user']['mentorId'],
              },
            },
            category: {
              connect: {
                id: validatedCreateAssistanceDto.categoryId,
              },
            },
          },
        });
      const assistanceTagsInsertPayload = Array.from(
        validatedCreateAssistanceDto.tagId,
      ).map((value) => ({
        assistanceId: updateAssistancePrisma.id,
        tagId: value as number,
      }));
      await prismaTransaction.assistanceTags.createMany({
        data: assistanceTagsInsertPayload,
      });
    });
    return 'Success! assistance has been updated';
  }

  async remove(id: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const assistancePrisma: Assistance = await prismaTransaction.assistance
        .findFirstOrThrow({
          where: {
            id: id,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Assistance with assistanceId ${id} not found`,
          );
        });
      const assistanceResources =
        await prismaTransaction.assistanceResource.findMany({
          where: {
            assistanceId: assistancePrisma.id,
          },
        });
      for (const assistanceResource of assistanceResources) {
        fs.unlink(
          `${this.configService.get<string>('MULTER_DEST')}/assistance-resources/${this.expressRequest['user']['mentorId']}/${assistancePrisma.id}/${assistanceResource.imagePath}`,
          () => {},
        );
      }
      await prismaTransaction.assistanceResource.deleteMany({
        where: {
          assistanceId: assistancePrisma.id,
        },
      });
      await prismaTransaction.assistanceTags.deleteMany({
        where: {
          assistanceId: assistancePrisma.id,
        },
      });
      await prismaTransaction.assistance.delete({
        where: {
          id: assistancePrisma.id,
        },
      });
    });
    return `Success! assistance with assistanceId ${id} has been deleted`;
  }
}
