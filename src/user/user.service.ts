import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import PrismaService from '../common/prisma.service';
import { Mentor, User, UserGender } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const createUserRequest: User = await this.validationService.validateAsync(
      UserValidation.userValidationWrapper(this.prismaService),
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
      return prismaTransaction.user.findFirstOrThrow({
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
    this.prismaService.$transaction(async (prismaTransaction) => {
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
}
