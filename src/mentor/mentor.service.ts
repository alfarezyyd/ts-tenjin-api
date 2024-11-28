import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { Mentor, User } from '@prisma/client';
import {
  RegisterMentorDto,
  RegisterMentorResourceDto,
} from './dto/register-mentor.dto';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { MentorValidation } from './mentor.validation';
import CommonHelper from '../helper/common.helper';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MentorService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    uploadedFiles: RegisterMentorResourceDto,
    currentUser: LoggedUser,
    registerMentorDto: RegisterMentorDto,
  ) {
    const validatedRegisterMentorDto = this.validationService.validate(
      MentorValidation.CREATE,
      registerMentorDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: currentUser.uniqueId,
          },
        })
        .catch(() => {
          throw new HttpException(
            `User with uniqueId ${currentUser.uniqueId} not found`,
            404,
          );
        });
      const mentorPrisma: Mentor = await prismaTransaction.mentor.create({
        data: {
          userId: userPrisma.id,
        },
      });
      await prismaTransaction.mentorAddress.create({
        data: {
          ...validatedRegisterMentorDto.mentorAddress,
          mentorId: mentorPrisma.id,
        },
      });
      await prismaTransaction.mentorBankAccount.create({
        data: {
          ...validatedRegisterMentorDto.mentorBankAccount,
          mentorId: mentorPrisma.id,
        },
      });
      const mentorResourcesPayload = [];
      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.curriculumVitae[0],
          `mentor-resources/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
      });
      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.identityCard[0],
          `mentor-resources/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
      });

      mentorResourcesPayload.push({
        imagePath: await CommonHelper.handleSaveFile(
          this.configService,
          uploadedFiles.photo[0],
          `mentor-resources/${mentorPrisma.id}`,
        ),
        mentorId: mentorPrisma.id,
      });

      await prismaTransaction.mentorResource.createMany({
        data: mentorResourcesPayload,
      });
      const payloadJwt = {
        uniqueId: currentUser.uniqueId,
        email: currentUser.email,
        mentorId: mentorPrisma.id,
      };
      return {
        accessToken: await this.jwtService.signAsync(payloadJwt),
      };
    });
  }

  async findOne(uniqueId: string) {
    return this.prismaService.mentor
      .findFirstOrThrow({
        where: {
          user: {
            uniqueId: uniqueId,
          },
        },
        include: {
          user: true,
          Assistance: {
            include: {
              category: true,
              AssistanceLanguage: {
                include: {
                  language: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              AssistanceTag: {
                include: {
                  tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              AssistanceResource: true,
            },
          },
          MentorResource: true,
          Experience: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          Education: {
            take: 1,
            orderBy: {
              endDate: 'desc',
            },
          },
          MentorAddress: {
            select: {
              district: true,
              province: true,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Mentor not found');
      });
  }

  update(id: number, updateMentorDto: UpdateMentorDto) {
    return `This action updates a #${id} mentor`;
  }

  remove(id: number) {
    return `This action removes a #${id} mentor`;
  }
}
