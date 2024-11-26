import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
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
import CommonHelper from '../helper/common.helper';
import LoggedUser from '../authentication/dto/logged-user.dto';
import ConvertHelper from '../helper/convert.helper';

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

  async store(
    createAssistanceDto: CreateAssistanceDto,
    assistanceResources: Array<Express.Multer.File>,
  ) {
    const validatedCreateAssistanceDto = this.validationService.validate(
      AssistanceValidation.SAVE,
      createAssistanceDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
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
            id: validatedCreateAssistanceDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${validatedCreateAssistanceDto.categoryId} not found`,
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
      const allLanguagePrisma: Language[] =
        await prismaTransaction.language.findMany({
          where: {
            id: {
              in: [...validatedCreateAssistanceDto.languages],
            },
          },
        });
      console.log(
        allLanguagePrisma,
        validatedCreateAssistanceDto.languages.size,
      );
      if (
        allLanguagePrisma.length != validatedCreateAssistanceDto.languages.size
      ) {
        throw new NotFoundException('Some languageId not found');
      }
      const { tagId, categoryId, languages, ...prismaPayload } =
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
                id: categoryId,
              },
            },
          },
        });
      const assistanceResourceInsertPayload = [];
      for (const assistanceResource of assistanceResources) {
        const newResourceFileName = await CommonHelper.handleSaveFile(
          this.configService,
          assistanceResource,
          `assistants/${this.expressRequest['user']['mentorId']}/${newAssistancePrisma.id}`,
        );
        assistanceResourceInsertPayload.push({
          assistantId: newAssistancePrisma.id,
          imagePath: newResourceFileName,
        });
      }
      await prismaTransaction.assistanceResource.createMany({
        data: assistanceResourceInsertPayload,
      });
      const assistanceTagsInsertPayload = Array.from(tagId).map((value) => ({
        assistantId: newAssistancePrisma.id,
        tagId: value as number,
      }));
      await prismaTransaction.assistanceTags.createMany({
        data: assistanceTagsInsertPayload,
      });
      const assistanceLanguagesInsertPayload = Array.from(languages).map(
        (value) => ({
          assistantId: newAssistancePrisma.id,
          languageId: value as number,
        }),
      );
      await prismaTransaction.assistanceLanguage.createMany({
        data: assistanceLanguagesInsertPayload,
      });
      return 'Success! new assistance has been created';
    });
  }

  async findAll(): Promise<ResponseAssistanceDto[]> {
    const allAssistantsWithRelationship =
      await this.prismaService.assistance.findMany({
        include: {
          mentor: {
            include: {
              user: true,
            },
          },
          category: true,
          AssistanceLanguage: true,
          AssistanceTag: {
            select: {
              tagId: true,
            },
          },
          AssistanceResource: {
            select: {
              imagePath: true,
            },
          },
        },
      });
    return ConvertHelper.assistantPrismaIntoAssistantResponse(
      allAssistantsWithRelationship,
    );
  }

  async findOne(id: number) {
    return this.prismaService.assistance
      .findFirstOrThrow({
        where: {
          id: id,
        },
        include: {
          mentor: {
            include: {
              user: true,
            },
          },
          category: true,
          AssistanceLanguage: true,
          AssistanceTag: true,
          AssistanceResource: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('Assistance not found');
      });
  }

  async update(
    assistantId: bigint,
    updateAssistanceDto: UpdateAssistanceDto,
    uploadedFiles: Array<Express.Multer.File>,
  ) {
    const validatedUpdateAssistanceDto = this.validationService.validate(
      AssistanceValidation.UPDATE,
      updateAssistanceDto,
    );
    console.log(validatedUpdateAssistanceDto);

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
            id: Number(updateAssistanceDto.categoryId),
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
            in: [...validatedUpdateAssistanceDto.tagId],
          },
        },
      });
      const allLanguagePrisma: Language[] =
        await prismaTransaction.language.findMany({
          where: {
            id: {
              in: [...validatedUpdateAssistanceDto.languages],
            },
          },
        });
      if (allTagPrisma.length != validatedUpdateAssistanceDto.tagId.size) {
        throw new NotFoundException(`Some tagId not found`);
      }
      if (
        allLanguagePrisma.length != validatedUpdateAssistanceDto.languages.size
      ) {
        throw new NotFoundException('Some languages not found');
      }
      const {
        tagId,
        categoryId,
        languages,
        deletedFilesName,
        ...prismaPayload
      } = validatedUpdateAssistanceDto;
      const updateAssistancePrisma: Assistance =
        await prismaTransaction.assistance.update({
          where: {
            id: assistantId,
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
                id: categoryId,
              },
            },
          },
        });
      const allAssistanceResourcePayload = [];
      for (const file of uploadedFiles) {
        const newResourceImagePath = await CommonHelper.handleSaveFile(
          this.configService,
          file,
          `assistants/${this.expressRequest['user']['mentorId']}/${assistantId}`,
        );
        allAssistanceResourcePayload.push({
          assistantId: assistantId,
          imagePath: newResourceImagePath,
        });
      }
      await prismaTransaction.assistanceResource.createMany({
        data: allAssistanceResourcePayload,
      });
      if (deletedFilesName !== undefined && deletedFilesName.length > 0) {
        const allDeletedFilesName =
          await prismaTransaction.assistanceResource.findMany({
            where: {
              assistantId: assistantId,
              imagePath: {
                in: deletedFilesName,
              },
            },
          });

        for (const deletedFileName of allDeletedFilesName) {
          fs.stat(
            `${this.configService.get<string>('MULTER_DEST')}/assistants/${this.expressRequest['user']['mentorId']}/${assistantId}/${deletedFileName}`,
            function (err) {
              if (err) {
                throw new NotFoundException(
                  `File with fileName ${deletedFileName} not found`,
                );
              }
            },
          );

          for (const deletedFileName of deletedFilesName) {
            fs.unlink(
              `${this.configService.get<string>('MULTER_DEST')}/assistants/${this.expressRequest['user']['mentorId']}/${assistantId}/${deletedFileName}`,
              (err) => {
                if (err) {
                  throw new HttpException(
                    `Error when trying to change file`,
                    500,
                  );
                }
              },
            );
          }
        }
      }
      const filteredNewTag = Array.from(tagId).filter(
        (tagId) => !allTagPrisma.some((tag) => tag.id === tagId),
      );
      const assistanceTagsInsertPayload = Array.from(filteredNewTag).map(
        (value) => ({
          assistantId: updateAssistancePrisma.id,
          tagId: value as number,
        }),
      );
      await prismaTransaction.assistanceTags.createMany({
        data: assistanceTagsInsertPayload,
      });
      const filteredNewLanguage = Array.from(languages).filter(
        (language) =>
          !allLanguagePrisma.some(
            (languagePrisma) => languagePrisma.id === language,
          ),
      );
      const assistanceLanguagesInsertPayload = Array.from(
        filteredNewLanguage,
      ).map((value) => ({
        assistantId: updateAssistancePrisma.id,
        languageId: value as number,
      }));
      await prismaTransaction.assistanceLanguage.createMany({
        data: assistanceLanguagesInsertPayload,
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
            `Assistance with assistantId ${id} not found`,
          );
        });
      const assistanceResources =
        await prismaTransaction.assistanceResource.findMany({
          where: {
            assistantId: assistancePrisma.id,
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
          assistantId: assistancePrisma.id,
        },
      });
      await prismaTransaction.assistanceTags.deleteMany({
        where: {
          assistantId: assistancePrisma.id,
        },
      });
      await prismaTransaction.assistanceLanguage.deleteMany({
        where: {
          assistantId: assistancePrisma.id,
        },
      });
      await prismaTransaction.assistance.delete({
        where: {
          id: assistancePrisma.id,
        },
      });
    });
    return `Success! assistance with assistantId ${id} has been deleted`;
  }

  async findAllByMentor(
    loggedUser: LoggedUser,
  ): Promise<ResponseAssistanceDto[]> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: BigInt(loggedUser.mentorId),
            user: {
              uniqueId: loggedUser.uniqueId,
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(`User or mentor not found`);
        });
      const allAssistantsWithRelationship =
        await prismaTransaction.assistance.findMany({
          where: {
            mentorId: BigInt(loggedUser.mentorId),
          },
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
            category: true,
            AssistanceLanguage: true,
            AssistanceTag: {
              select: {
                tagId: true,
              },
            },
            AssistanceResource: {
              select: {
                imagePath: true,
              },
            },
          },
        });
      return ConvertHelper.assistantPrismaIntoAssistantResponse(
        allAssistantsWithRelationship,
      );
    });
  }
}
