import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationService } from '../common/validation.service';
import { UserValidation } from './user.validation';
import { PrismaService } from '../common/prisma.service';
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
    await this.prismaService.user.create({
      data: createUserRequest,
    });
    return 'Success! new user has been created';
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: bigint): Promise<User> {
    return this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message(), 400);
      });
  }

  async update(id: bigint, updateUserDto: UpdateUserDto): Promise<string> {
    let userPrisma: User = await this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message(), 400);
      });
    userPrisma = {
      ...userPrisma,
      ...updateUserDto,
      gender: userGender[updateUserDto.gender],
    };

    await this.prismaService.user.update({
      data: userPrisma,
      where: {
        id: id,
      },
    });
    return 'Success! user has been updated';
  }

  async remove(id: bigint): Promise<string> {
    this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message(), 400);
      });
    await this.prismaService.user.delete({
      where: {
        id: id,
      },
    });
    return `Success! user has been deleted`;
  }
}
