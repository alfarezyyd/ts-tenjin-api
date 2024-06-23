import { HttpException, Injectable } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { Education } from '@prisma/client';
import EducationValidation from './education.validation';

@Injectable()
export class EducationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(mentorId: bigint, createEducationDto: CreateEducationDto) {
    const validatedCreateEducationDto: Education =
      this.validationService.validate(
        EducationValidation.SAVE,
        createEducationDto,
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
      prismaTransaction.education.create({
        data: {
          ...validatedCreateEducationDto,
          mentorId: mentorId,
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
        EducationValidation.SAVE,
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
          id: mentorId,
        },
      });
    });

    return 'Success! new education has been created';
  }

  async remove(mentorId: bigint, educationid: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      prismaTransaction.education.deleteMany({
        where: {
          AND: [{ id: educationid }, { mentorId: mentorId }],
        },
      });
    });
  }
}
