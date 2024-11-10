import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { Education, Mentor } from '@prisma/client';
import EducationValidation from './education.validation';
import { REQUEST } from '@nestjs/core';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { ResponseExperienceDto } from '../experience/dto/response-experience.dto';
import ResponseEducationDto from './dto/response-education.dto';

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

  async findAllByMentor(
    loggedUser: LoggedUser,
  ): Promise<ResponseEducationDto[]> {
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
      const mentorPrisma: Mentor = await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            userId: userPrisma.id,
            id: BigInt(loggedUser.mentorId),
          },
        })
        .catch(() => {
          throw new NotFoundException(`User haven't registered as mentor`);
        });
      const allMentorEducation: Education[] =
        await prismaTransaction.education.findMany({
          where: {
            mentorId: mentorPrisma.id,
          },
        });
      return allMentorEducation.map((mentorEducation) => {
        const mentorEducationResponse: ResponseEducationDto = {
          ...mentorEducation,
          id: mentorEducation.id,
          mentorId: mentorEducation.mentorId,
        };
        return mentorEducationResponse;
      });
    });
  }

  async findOne(
    loggedUser: LoggedUser,
    id: number,
  ): Promise<ResponseEducationDto> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const mentorPrisma: Mentor = await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: BigInt(loggedUser.mentorId),
            user: {
              uniqueId: loggedUser.uniqueId,
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Mentor or user data not found`);
        });
      const educationPrisma: Education = await prismaTransaction.education
        .findFirstOrThrow({
          where: {
            mentorId: mentorPrisma.id,
            id,
          },
        })
        .catch(() => {
          throw new NotFoundException(`Education data not found`);
        });
      let responseEducationDto = new ResponseEducationDto();
      responseEducationDto = { ...educationPrisma };
      return responseEducationDto;
    });
  }

  async update(
    loggedUser: LoggedUser,
    updateEducationDto: UpdateEducationDto,
    id: number,
  ): Promise<boolean> {
    const validatedCreateEducationDto: Education =
      this.validationService.validate(
        EducationValidation.UPDATE,
        updateEducationDto,
      );
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
          throw new HttpException(
            `Mentor with mentorId ${loggedUser.mentorId} not found`,
            404,
          );
        });
      await prismaTransaction.education.update({
        data: {
          ...validatedCreateEducationDto,
        },
        where: {
          id,
        },
      });
      return true;
    });
  }

  async remove(educationId: bigint): Promise<boolean> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.education.deleteMany({
        where: {
          AND: [
            { id: educationId },
            { mentorId: this.expressRequest['user']['mentorId'] },
          ],
        },
      });
      return true;
    });
  }
}
