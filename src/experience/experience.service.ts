import { HttpException, Inject, Injectable, Scope } from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import ExperienceValidation from './experience.validation';
import CommonHelper from '../helper/common.helper';
import { ConfigService } from '@nestjs/config';
import { Experience } from '@prisma/client';
import { REQUEST } from '@nestjs/core';

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
            `experience-resources/${this.expressRequest['user']['mentorId']}`,
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

  async update(mentorId: bigint, updateExperienceDto: UpdateExperienceDto) {
    const validatedUpdateExperienceDto = await this.validationService.validate(
      ExperienceValidation.UPDATE,
      updateExperienceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: mentorId,
          },
        })
        .catch(() => {
          throw new HttpException(
            `Mentor with mentorId ${mentorId} not found`,
            404,
          );
        });

      await prismaTransaction.experience.updateMany({
        data: {
          ...validatedUpdateExperienceDto,
        },
        where: {
          AND: [
            { id: updateExperienceDto.experienceId },
            { mentorId: mentorId },
          ],
        },
      });
    });
    return 'Success! new experience has been created';
  }

  async remove(mentorId: bigint, experienceId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.experience.deleteMany({
        where: {
          AND: [{ mentorId: mentorId }, { id: experienceId }],
        },
      });
    });
    return 'Success! experience has been removed';
  }
}
