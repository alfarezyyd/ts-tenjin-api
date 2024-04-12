import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import PrismaService from '../common/prisma.service';
import { User, userGender } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const createUserRequest = this.validationService.validate(
      UserValidation.CREATE,
      createUserDto,
    );
    const userPrisma = await this.prismaService.user
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
        method: 'post',
        url: `http://localhost:9200/zenith_users/_create/${userPrisma.id}`,
        headers: {
          contentType: 'application/json',
        },
        data: {
          name: userPrisma.name,
          gender: userPrisma.gender,
          email: userPrisma.email,
          telephone: userPrisma.telephone,
          pin: userPrisma.pin,
          photo_path: userPrisma.photoPath,
        },
      })
      .catch(function (error) {
        console.log(error);
      });
    return 'Success! new user has been created';
  }

  async findOne(userId: bigint): Promise<User> {
    return this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: userId,
        },
      })
      .catch(() => {
        throw new HttpException(`User with userId ${userId} not found`, 404);
      });
  }

  async update(userId: bigint, updateUserDto: UpdateUserDto): Promise<string> {
    let userPrisma: User = await this.prismaService.user
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

    await this.prismaService.user.update({
      data: userPrisma,
      where: {
        id: userId,
      },
    });
    return 'Success! user has been updated';
  }

  async remove(userId: bigint): Promise<string> {
    this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: userId,
        },
      })
      .catch(() => {
        throw new HttpException(`User with userId ${userId} not found`, 404);
      });
    await this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });
    return `Success! user has been deleted`;
  }
}
