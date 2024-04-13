import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import PrismaService from '../common/prisma.service';
import { User, userGender } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const createUserRequest = this.validationService.validate(
      UserValidation.CREATE,
      createUserDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .create({
          data: {
            ...createUserRequest,
            gender: userGender[createUserDto.gender],
          },
        })
        .catch((reason) => {
          throw new HttpException(reason.message, 400);
        });

      await this.prismaService.cart
        .create({
          data: {
            userId: userPrisma.id,
          },
        })
        .catch((reason) => {
          throw new HttpException(reason.message, 400);
        });

      await this.httpService
        .axiosRef({
          method: 'POST',
          url: `${this.configService.get<string>('ELASTICSEARCH_NODE')}/zenith_users/_create/${userPrisma.id}`,
          headers: {
            contentType: 'application/json',
          },
          data: { ...userPrisma },
        })
        .catch(function () {
          throw new AxiosError('Error occurred when trying to write!', '500');
        });
    });
    return 'Success! new user has been created';
  }

  async findOne(userId: bigint): Promise<User> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      return prismaTransaction.user
        .findFirstOrThrow({
          where: {
            id: userId,
          },
        })
        .catch(() => {
          throw new HttpException(`User with userId ${userId} not found`, 404);
        });
    });
  }

  async update(userId: bigint, updateUserDto: UpdateUserDto): Promise<string> {
    this.prismaService.$transaction(async (prismaTransaction) => {
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
        gender: userGender[updateUserDto.gender],
      };
      await prismaTransaction.user.update({
        data: userPrisma,
        where: {
          id: userId,
        },
      });
    });
    return 'Success! user has been updated';
  }

  async remove(userId: bigint): Promise<string> {
    this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            id: userId,
          },
        })
        .catch(() => {
          throw new HttpException(`User with userId ${userId} not found`, 404);
        });
      await prismaTransaction.user.delete({
        where: {
          id: userId,
        },
      });
    });
    return `Success! user has been deleted`;
  }
}
