import {
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
import { Experience } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import * as fs from 'node:fs';

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
  ) {
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

  findAll() {
    return `This action returns all experience`;
  }

  findOne(id: number) {
    return `This action returns a #${id} experience`;
  }

  async update(
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
      for (const deletedFileName of validatedUpdateExperienceDto.deletedFilesName) {
        fs.stat(
          `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${updateExperienceDto.experienceId}/${deletedFileName}`,
          function (err) {
            if (err) {
              throw new NotFoundException(
                `File with fileName ${deletedFileName} not found`,
              );
            }
          },
        );
      }

      for (const deletedFileName of validatedUpdateExperienceDto.deletedFilesName) {
        fs.unlink(
          `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${updateExperienceDto.experienceId}/${deletedFileName}`,
          (err) => {
            if (err) {
              throw new HttpException(`Error when trying to change file`, 500);
            }
          },
        );
      }

      await prismaTransaction.experienceResource.deleteMany({
        where: {
          experienceId: updateExperienceDto.experienceId,
          imagePath: {
            in: validatedUpdateExperienceDto.deletedFilesName,
          },
        },
      });

      await prismaTransaction.experience.updateMany({
        data: {
          ...validatedUpdateExperienceDto,
        },
        where: {
          AND: [
            { id: updateExperienceDto.experienceId },
            { mentorId: this.expressRequest['user']['mentorId'] },
          ],
        },
      });

      const allExperienceResourcePayload = [];
      for (const experienceResource of experienceResources) {
        allExperienceResourcePayload.push({
          experienceId: updateExperienceDto.experienceId,
          imagePath: await CommonHelper.handleSaveFile(
            this.configService,
            experienceResource,
            `experience-resources/${this.expressRequest['user']['mentorId']}/${updateExperienceDto.experienceId}`,
          ),
        });
      }

      await prismaTransaction.experienceResource.createMany({
        data: allExperienceResourcePayload,
      });
    });
    return 'Success! new experience has been created';
  }

  async remove(experienceId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.experienceResource.deleteMany({
        where: {
          experienceId: experienceId,
        },
      });
      fs.rmdir(
        `${this.configService.get<string>('MULTER_DEST')}/experience-resources/${this.expressRequest['user']['mentorId']}/${experienceId}`,
        function (err) {
          if (err) {
            throw new HttpException(
              `Error when trying to remove experience`,
              500,
            );
          }
        },
      );
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
