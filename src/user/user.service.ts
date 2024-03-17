import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationService } from '../common/validation.service';
import { UserValidation } from './user.validation';
import { PrismaService } from '../common/prisma.service';
import { User } from '@prisma/client';

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
    return 'Success! new user created';
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: bigint): Promise<User> {
    return this.prismaService.user
      .findUniqueOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw reason.message();
      });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
