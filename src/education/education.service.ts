import { HttpException, Inject, Injectable, Scope } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { Education } from '@prisma/client';
import EducationValidation from './education.validation';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class EducationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(createEducationDto: CreateEducationDto) {
    const validatedCreateEducationDto: Education =
      this.validationService.validate(
        EducationValidation.SAVE,
        createEducationDto,
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
      await prismaTransaction.education.create({
        data: {
          ...validatedCreateEducationDto,
          mentorId: this.expressRequest['user']['mentorId'],
        },
      });
    });

    return 'Success! new education has been created';
  }

  findAll() {
    return `This action returns all education`;
  }

  findOne(id: number) {
    return `This action returns a #${id} education`;
  }

  async update(mentorId: bigint, updateEducationDto: UpdateEducationDto) {
    const validatedCreateEducationDto: Education =
      this.validationService.validate(
        EducationValidation.UPDATE,
        updateEducationDto,
      );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      prismaTransaction.mentor
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
      prismaTransaction.education.update({
        data: {
          ...validatedCreateEducationDto,
        },
        where: {
          id: updateEducationDto.educationId,
        },
      });
    });

    return 'Success! new education has been updated';
  }

  async remove(mentorId: bigint, educationId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      prismaTransaction.education.deleteMany({
        where: {
          AND: [{ id: educationId }, { mentorId: mentorId }],
        },
      });
    });
  }
}
