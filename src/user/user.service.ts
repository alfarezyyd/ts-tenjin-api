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
import { ZodError } from 'zod';
import { MentorService } from '../mentor/mentor.service';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly mentorService: MentorService,
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
  ): Promise<string> {
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
          select: {
            photoPath: true,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
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
      await prismaTransaction.user.update({
        where: {
          uniqueId: loggedUser.uniqueId,
        },
        data: {
          ...validatedSettingGeneralDataUserDto, // Menyebarkan data baru untuk di-update
          gender: UserGender[validatedSettingGeneralDataUserDto.gender],
          photoPath: nameFile,
          telephone: validatedSettingGeneralDataUserDto.telephone,
          emailVerifiedAt: null,
        },
      });
      return 'Success! settings user has been updated';
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
      console.log(validatedChangePassword);
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
}
