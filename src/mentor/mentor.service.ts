import { HttpException, Injectable } from '@nestjs/common';
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

  async findAllByCategoryId() {}

  findOne(mentorId: bigint) {
    return `This action returns a #${mentorId} mentor`;
  }

  update(id: number, updateMentorDto: UpdateMentorDto) {
    return `This action updates a #${id} mentor`;
  }

  remove(id: number) {
    return `This action removes a #${id} mentor`;
  }
}
