import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WebResponse } from '../model/web.response';
import { ResponseUserDto } from './dto/response-user.dto';
import ConvertHelper from '../helper/convert.helper';
import { User } from '@prisma/client';
import { Public } from '../authentication/set-metadata.decorator';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @HttpCode(201)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.userService.create(createUserDto),
      },
    };
  }

  @Get(':userId')
  async findOne(
    @Param('userId') userId: string,
  ): Promise<WebResponse<ResponseUserDto>> {
    const userDetail: User = await this.userService.findOne(userId);
    return {
      result: {
        data: await ConvertHelper.userPrismaIntoUserResponse(userDetail),
      },
    };
  }

  @Put(':userId')
  async update(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.userService.update(userId, updateUserDto),
      },
    };
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: bigint): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.userService.remove(userId),
      },
    };
  }
}
