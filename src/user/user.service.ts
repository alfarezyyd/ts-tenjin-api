import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import ValidationService from '../common/validation.service';
import { UserValidation } from './user.validation';
import PrismaService from '../common/prisma.service';
import { User, userGender } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<string> {
    const createUserRequest = this.validationService.validate(
      UserValidation.CREATE,
      createUserDto,
    );
    const userPrisma = await this.prismaService.user.create({
      data: {
        ...createUserRequest,
        gender: userGender[createUserDto.gender],
      },
    });

    await this.prismaService.cart.create({
      data: {
        userId: userPrisma.id,
      },
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
