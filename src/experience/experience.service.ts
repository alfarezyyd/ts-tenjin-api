import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import ExperienceValidation from './experience.validation';
import CommonHelper from '../helper/common.helper';
import { ConfigService } from '@nestjs/config';
import { EmploymentType, Experience } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import * as fs from 'node:fs';
import * as fsPromise from 'node:fs/promises';
import LoggedUser from '../authentication/dto/logged-user.dto';
import {
  ResponseExperienceDto,
  ResponseExperienceResourceDto,
} from './dto/response-experience.dto';

@Injectable({ scope: Scope.REQUEST })
export class ExperienceService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly expressRequest: Request,
    private readonly configService: ConfigService,
  ) {}

  async create(
    experienceResources: Array<Express.Multer.File>,
    createExperienceDto: CreateExperienceDto,
  ): Promise<string> {
    const validatedCreateExperienceDto = await this.validationService.validate(
      ExperienceValidation.CREATE,
      createExperienceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: this.expressRequest['user']['mentorId'],
          },
        })
        .catch(() => {
          throw new HttpException(
            `Mentor with mentorId ${this.expressRequest['user']['mentorId']} not found`,
            404,
          );
        });
      const experiencePrisma: Experience =
        await prismaTransaction.experience.create({
          data: {
            ...validatedCreateExperienceDto,
            mentorId: this.expressRequest['user']['mentorId'],
          },
        });
      const allExperienceResourcePayload = [];
      for (const experienceResource of experienceResources) {
        allExperienceResourcePayload.push({
          experienceId: experiencePrisma.id,
          imagePath: await CommonHelper.handleSaveFile(
            this.configService,
            experienceResource,
            `experience-resources/${this.expressRequest['user']['mentorId']}/${experiencePrisma.id}`,
          ),
        });
      }

      await prismaTransaction.experienceResource.createMany({
        data: allExperienceResourcePayload,
      });
    });
    return 'Success! new experience has been created';
  }

  async findAllByMentor(
    loggedUser: LoggedUser,
  ): Promise<ResponseExperienceDto[]> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException(`User not found`);
        });
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            userId: userPrisma.id,
            id: BigInt(loggedUser.mentorId),
          },
        })
        .catch(() => {
          throw new NotFoundException(`User haven't registered as mentor`);
        });
      const allMentorExperience = await prismaTransaction.experience.findMany({
        where: {
          mentorId: BigInt(loggedUser.mentorId),
        },
        include: {
          ExperienceResource: true,
        },
      });
      return allMentorExperience.map((mentorExperience) => {
        const allMentorExperienceResource: ResponseExperienceResourceDto[] = [];
        for (const mentorExperienceResourceElement of mentorExperience.ExperienceResource) {
          const mentorExperienceResource: ResponseExperienceResourceDto = {
            id: mentorExperienceResourceElement.id.toString(),
            imagePath: mentorExperienceResourceElement.imagePath,
            videoUrl: mentorExperienceResourceElement.videoUrl,
          };
          allMentorExperienceResource.push(mentorExperienceResource);
        }
        delete mentorExperience.ExperienceResource;
        const responseExperienceDto: ResponseExperienceDto = {
          ...mentorExperience,
          id: mentorExperience.id,
          mentorId: mentorExperience.mentorId,
          experienceResource: allMentorExperienceResource,
        };

        return responseExperienceDto;
      });
    });
  }

  async employmentTypeEnum() {
    return Object.values(EmploymentType);
  }

  async findOne(
    currentUser: LoggedUser,
    id: number,
  ): Promise<ResponseExperienceDto> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const experiencePrisma: Experience = await prismaTransaction.experience
        .findFirstOrThrow({
          where: {
            id: id,
            mentorId: BigInt(currentUser.mentorId),
            Mentor: {
              user: {
                uniqueId: currentUser.uniqueId,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Experience not found`);
        });
      const allExperienceResource =
        await prismaTransaction.experienceResource.findMany({
          where: {
            experienceId: experiencePrisma.id,
          },
        });
      let responseExperienceDto = new ResponseExperienceDto();
      responseExperienceDto = { ...experiencePrisma, experienceResource: [] };
      for (const experienceResource of allExperienceResource) {
        let responseExperienceResource = new ResponseExperienceResourceDto();
        responseExperienceResource = {
          ...experienceResource,
          id: experienceResource.id.toString(),
        };
        responseExperienceDto['experienceResource'].push(
          responseExperienceResource,
        );
      }
      return responseExperienceDto;
    });
  }

  async update(
    experienceId: bigint,
    experienceResources: Array<Express.Multer.File>,
    updateExperienceDto: UpdateExperienceDto,
  ) {
    const validatedUpdateExperienceDto = await this.validationService.validate(
      ExperienceValidation.UPDATE,
      updateExperienceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: this.expressRequest['user']['mentorId'],
          },
        })
        .catch(() => {
          throw new HttpException(
            `Mentor with mentorId ${this.expressRequest['user']['mentorId']} not found`,
            404,
          );
        });
      const { deletedFilesName, ...shatteredValidatedUpdateExperienceDto } =
        validatedUpdateExperienceDto;

      await prismaTransaction.experience.updateMany({
        data: {
          ...shatteredValidatedUpdateExperienceDto,
        },
        where: {
          AND: [
            { id: experienceId },
            { mentorId: this.expressRequest['user']['mentorId'] },
          ],
        },
      });

      if (deletedFilesName !== undefined && deletedFilesName?.length > 0) {
        const countAllExperienceResource =
          await prismaTransaction.experienceResource.count({
            where: {
              experienceId: experienceId,
            },
          });
        console.log(
          countAllExperienceResource,
          deletedFilesName.length,
          experienceResources.length,
        );
        if (
          countAllExperienceResource === deletedFilesName.length &&
          experienceResources.length == 0
        ) {
          throw new BadRequestException('Please upload at least one image');
        }
        await prismaTransaction.experienceResource.deleteMany({
          where: {
            experienceId: experienceId,
            imagePath: {
              in: deletedFilesName,
            },
          },
        });
        for (const deletedFileName of deletedFilesName) {
          fs.stat(
            `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${experienceId}/${deletedFileName}`,
            function (err) {
              if (err) {
                throw new NotFoundException(
                  `File with fileName ${deletedFileName} not found`,
                );
              }
            },
          );
        }

        for (const deletedFileName of deletedFilesName) {
          fs.unlink(
            `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${experienceId}/${deletedFileName}`,
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

        const allExperienceResourcePayload = [];
        for (const experienceResource of experienceResources) {
          allExperienceResourcePayload.push({
            experienceId: experienceId,
            imagePath: await CommonHelper.handleSaveFile(
              this.configService,
              experienceResource,
              `experience-resources/${this.expressRequest['user']['mentorId']}/${experienceId}`,
            ),
          });
        }

        await prismaTransaction.experienceResource.createMany({
          data: allExperienceResourcePayload,
        });
      }
    });
    return 'Success! new experience has been updated';
  }

  async remove(experienceId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.experienceResource.deleteMany({
        where: {
          experienceId: experienceId,
        },
      });
      try {
        await fsPromise.rm(
          `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${experienceId}`,
          { recursive: true },
        );
      } catch (err) {
        throw new HttpException(`Error when trying to remove experience`, 500);
      }
      await prismaTransaction.experience.deleteMany({
        where: {
          AND: [
            { mentorId: this.expressRequest['user']['mentorId'] },
            { id: experienceId },
          ],
        },
      });
    });
    return 'Success! experience has been removed';
  }
}
