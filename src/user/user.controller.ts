import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WebResponse } from '../model/web.response';
import { ResponseUserDto } from './dto/response-user.dto';
import { ConvertHelper } from '../helper/convert.helper';
import { User } from '@prisma/client';

@Controller('api/user')
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
