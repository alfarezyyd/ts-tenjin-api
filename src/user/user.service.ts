import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import PrismaService from '../common/prisma.service';
import { Mentor, OrderStatus, User, UserGender } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SettingGeneralDataUserDto } from './dto/setting-general-data-user.dto';
import LoggedUser from '../authentication/dto/logged-user.dto';
import CommonHelper from '../helper/common.helper';
import * as fs from 'node:fs';
import { join } from 'path';
import { ChangePassword } from './dto/change-password.dto';
import { z, ZodError } from 'zod';
import { MentorService } from '../mentor/mentor.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from '../authentication/dto/response-authentication';
import { SettingMentorInformationDto } from './dto/setting-mentor-information.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly mentorService: MentorService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const createUserRequest: User = await this.validationService.validate(
      UserValidation.SAVE,
      createUserDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.user
        .create({
          data: {
            ...createUserRequest,
            gender: UserGender[createUserDto.gender],
            password: await bcrypt.hash(createUserDto.password, 10),
            uniqueId: uuidv4(),
          },
        })
        .catch((reason) => {
          throw new HttpException(reason.message, 400);
        });

      // await firstValueFrom(
      //   this.httpService.post(
      //     `${this.configService.get<string>('ELASTICSEARCH_NODE')}/tenjin_users/_create/${userPrisma.id}`,
      //     { ...userPrisma },
      //     {
      //       headers: {
      //         contentType: 'application/json',
      //       },
      //     },
      //   ),
      // ).catch(function () {
      //   throw new AxiosError('Error occurred when trying to write!', '500');
      // });
    });
    return 'Success! new user has been created';
  }

  async findOne(
    userIdentifier: string,
  ): Promise<User & { Mentor?: Mentor | null }> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      return prismaTransaction.user
        .findFirstOrThrow({
          where: {
            OR: [
              {
                email: userIdentifier,
              },
              {
                uniqueId: userIdentifier,
              },
            ],
          },
          include: {
            Mentor: true,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with email or uniqueId ${userIdentifier} not found`,
          );
        });
    });
  }

  async update(userId: bigint, updateUserDto: UpdateUserDto): Promise<string> {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      let userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            id: userId,
          },
        })
        .catch(() => {
          throw new HttpException(`User with userId ${userId}`, 404);
        });
      userPrisma = {
        ...userPrisma,
        ...updateUserDto,
        gender: UserGender[updateUserDto.gender],
      };
      await prismaTransaction.user.update({
        data: userPrisma,
        where: {
          id: userId,
        },
      });

      await firstValueFrom(
        this.httpService.post(
          `${this.configService.get<string>('ELASTICSEARCH_NODE')}/tenjin_users/_create/${userPrisma.id}`,
          { ...userPrisma },
          {
            headers: {
              contentType: 'application/json',
            },
          },
        ),
      ).catch(() => {
        throw new HttpException(`Failed to update`, 500);
      });
    });
    return 'Success! user has been updated';
  }

  async remove(userId: bigint): Promise<string> {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user.delete({
        where: {
          id: userId,
        },
      });
      if (userPrisma == null) {
        throw new HttpException(`User with userId ${userId} not found`, 404);
      }

      await firstValueFrom(
        this.httpService.post(
          `${this.configService.get<string>('ELASTICSEARCH_NODE')}/tenjin_users/_create/${userId}`,
        ),
      ).catch((reason) => {
        throw new HttpException(reason.message, 400);
      });
    });
    return `Success! user has been deleted`;
  }

  async settingGeneralData(
    settingGeneralDataUserDto: SettingGeneralDataUserDto,
    loggedUser: LoggedUser,
    photoFile: Express.Multer.File,
  ): Promise<ResponseAuthenticationDto> {
    const validatedSettingGeneralDataUserDto = this.validationService.validate(
      UserValidation.SETTING_GENERAL_DATA,
      settingGeneralDataUserDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
          include: {
            Mentor: true,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      const countPrisma = await prismaTransaction.user.count({
        where: {
          AND: [
            {
              telephone: validatedSettingGeneralDataUserDto.telephone,
            },
            {
              id: {
                not: userPrisma.id,
              },
            },
          ],
        },
      });
      if (
        countPrisma > 0 &&
        validatedSettingGeneralDataUserDto.telephone !== null
      ) {
        throw new z.ZodError([
          {
            path: ['telephone'], // Path yang menunjukkan masalah ada di field `email`
            message: `Telephone has been registered before`, // Pesan error
            code: 'custom', // Jenis error (custom karena tidak berasal dari validasi bawaan)
          },
        ]);
      }
      let nameFile = '';
      if (userPrisma.photoPath !== null) {
        const existingImagePath = join(
          process.cwd(),
          this.configService.get<string>('MULTER_DEST'),
          'user-resources',
          userPrisma.photoPath,
        );
        const isImageSame = await CommonHelper.compareImagesFromUpload(
          existingImagePath,
          photoFile,
        );
        nameFile = userPrisma.photoPath;
        if (!isImageSame) {
          try {
            fs.unlinkSync(existingImagePath);
          } catch (err) {
            if (err) {
              throw new HttpException(`Error when trying to update image`, 500);
            }
          }
          nameFile = await CommonHelper.handleSaveFile(
            this.configService,
            photoFile,
            'user-resources',
          );
        }
      } else {
        nameFile = await CommonHelper.handleSaveFile(
          this.configService,
          photoFile,
          'user-resources',
        );
      }
      let newEmailVerifiedAt = null;
      if (userPrisma.email === settingGeneralDataUserDto.email) {
        newEmailVerifiedAt = userPrisma.emailVerifiedAt;
      }
      const newUserPrisma = await prismaTransaction.user.update({
        where: {
          uniqueId: loggedUser.uniqueId,
        },
        data: {
          ...validatedSettingGeneralDataUserDto, // Menyebarkan data baru untuk di-update
          gender: UserGender[validatedSettingGeneralDataUserDto.gender],
          photoPath: nameFile,
          telephone: validatedSettingGeneralDataUserDto.telephone,
          emailVerifiedAt: newEmailVerifiedAt,
        },
      });
      const payloadJwt = {
        uniqueId: userPrisma.uniqueId,
        name: newUserPrisma.name,
        email: newUserPrisma.email,
        gender: newUserPrisma.gender,
        telephone: newUserPrisma.telephone,
        mentorId: userPrisma.Mentor?.id?.toString() ?? null,
        isExternal: userPrisma.isExternal,
        isManagement: userPrisma.isManagement,
        photoPath: userPrisma.photoPath,
      };
      return {
        accessToken: await this.jwtService.signAsync(payloadJwt),
      };
    });
  }

  async handleChangePassword(
    changePassword: ChangePassword,
    loggedUser: LoggedUser,
  ) {
    const validatedChangePassword = this.validationService.validate(
      UserValidation.SETTING_CHANGE_PASSWORD,
      changePassword,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });

      if (bcrypt.compareSync(userPrisma.password, changePassword.oldPassword)) {
        throw new ZodError([
          {
            path: ['oldPassword'], // Lokasi field yang error
            message: 'Password lama tidak sesuai.',
            code: 'custom', // Custom error code
          },
        ]);
      }

      const newPassword = await bcrypt.hash(
        validatedChangePassword.newPassword,
        10,
      );
      await prismaTransaction.user.update({
        where: {
          id: userPrisma.id,
        },
        data: {
          password: newPassword,
        },
      });
      return true;
    });
  }

  async handleFindOneSpecific(userPrisma: User & { Mentor?: Mentor | null }) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const allOrderPrisma = await prismaTransaction.order.findMany({
        where: {
          userId: userPrisma.id,
        },
        include: {
          assistance: {
            include: {
              mentor: {
                include: {
                  user: true,
                },
              },
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const allUserSchedule = [];
      const countOrder = {
        failed: 0,
        process: 0,
        completed: 0,
      };
      for (const orderPrisma of allOrderPrisma) {
        switch (orderPrisma.orderStatus) {
          case OrderStatus.FINISHED:
          case OrderStatus.REVIEWED:
            countOrder.completed++;
            break;
          case OrderStatus.PROCESSED:
          case OrderStatus.CONFIRMED:
            countOrder.process++;
            break;
          case OrderStatus.CANCELLED:
            countOrder.failed++;
            break;
          default:
            break;
        }
        allUserSchedule.push({
          title: orderPrisma.assistance.topic,
          mentorName: orderPrisma.assistance.mentor.user.name,
          meetingPlatform: orderPrisma.meetingPlatform,
          meetingPasskey: orderPrisma.meetingPasskey,
          meetingLink: orderPrisma.meetingLink,
          start: new Date(
            orderPrisma.sessionStartTimestamp.getTime() + 7 * 60 * 60 * 1000,
          ),
          end: new Date(
            orderPrisma.sessionEndTimestamp.getTime() + 7 * 60 * 60 * 1000,
          ),
        });
      }
      let mentorSchedule = [];
      let countMentorOrder = null;
      let lastFiveMentorOrders = [];
      if (userPrisma.Mentor !== null) {
        const resultMentorSchedule =
          await this.mentorService.findAllMentorSchedule(userPrisma.Mentor);
        mentorSchedule = resultMentorSchedule.allMentorSchedule;
        countMentorOrder = resultMentorSchedule.countMentorOrder;
        lastFiveMentorOrders = resultMentorSchedule.lastFiveMentorOrders;
      }
      return {
        countOrder: countOrder,
        countMentorOrder: countMentorOrder,
        schedule: allUserSchedule,
        mentorSchedule: mentorSchedule,
        lastFiveOrders: allOrderPrisma.slice(0, 5),
        lastFiveMentorOrders: lastFiveMentorOrders.slice(0, 5),
      };
    });
  }

  async settingMentorInformation(
    settingMentorInformation: SettingMentorInformationDto,
    loggedUser: LoggedUser,
    photoFile: Array<Express.Multer.File>,
  ) {
    const validatedSettingMentorInformation = this.validationService.validate(
      UserValidation.MENTOR_INFORMATION,
      settingMentorInformation,
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
          throw new NotFoundException('Mentor not found.');
        });
      if (
        validatedSettingMentorInformation.deletedFilesName !== undefined &&
        validatedSettingMentorInformation.deletedFilesName.length > 0
      ) {
        for (const deletedFileName of validatedSettingMentorInformation.deletedFilesName) {
          fs.stat(
            `${this.configService.get<string>('MULTER_DEST')}/mentor-resources/profile/${loggedUser.mentorId}/${deletedFileName}`,
            function (err) {
              if (err) {
                throw new NotFoundException(
                  `File with fileName ${deletedFileName} not found`,
                );
              }
            },
          );

          fs.unlink(
            `${this.configService.get<string>('MULTER_DEST')}/mentor-resources/profile/${loggedUser.mentorId}/${deletedFileName}`,
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
        await prismaTransaction.mentorResource.deleteMany({
          where: {
            mentorId: BigInt(loggedUser.mentorId),
            imagePath: {
              in: validatedSettingMentorInformation.deletedFilesName as string[],
            },
          },
        });
      }
      if (photoFile.length > 0) {
        const allGeneratedFileName = [];
        for (const photoElement of photoFile) {
          const generatedFileName = await CommonHelper.handleSaveFile(
            this.configService,
            photoElement,
            `mentor-resources/profile/${loggedUser.mentorId}`,
          );
          allGeneratedFileName.push(generatedFileName);
        }
        const mappedGeneratedFileName = allGeneratedFileName.map((fileName) => {
          return {
            imagePath: fileName,
            videoUrl: null,
            mentorId: BigInt(loggedUser.mentorId),
          };
        });
        await prismaTransaction.mentorResource.createMany({
          data: mappedGeneratedFileName,
        });
      }
      await prismaTransaction.mentor.update({
        where: {
          id: BigInt(loggedUser.mentorId),
          user: {
            uniqueId: loggedUser.uniqueId,
          },
        },
        data: {
          bio: validatedSettingMentorInformation.bio,
        },
      });
      return true;
    });
  }
}
