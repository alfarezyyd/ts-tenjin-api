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
import { ConvertHelper } from '../helper/convert.helper';
import { User } from '@prisma/client';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.userService.create(createUserDto),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: bigint,
  ): Promise<WebResponse<ResponseUserDto>> {
    const userDetail: User = await this.userService.findOne(id);
    return {
      data: await ConvertHelper.userPrismaIntoUserResponse(userDetail),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: bigint,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.userService.update(id, updateUserDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: bigint): Promise<WebResponse<string>> {
    return {
      data: await this.userService.remove(id),
    };
  }
}
