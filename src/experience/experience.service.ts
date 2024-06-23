import { HttpException, Injectable } from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import ExperienceValidation from './experience.validation';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(mentorId: bigint, createExperienceDto: CreateExperienceDto) {
    const validatedCreateExperienceDto = await this.validationService.validate(
      ExperienceValidation.CREATE,
      createExperienceDto,
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

      await prismaTransaction.experience.create({
        data: {
          ...validatedCreateExperienceDto,
          mentorId: mentorId,
        },
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
