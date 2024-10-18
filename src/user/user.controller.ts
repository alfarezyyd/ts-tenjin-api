import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WebResponse } from '../model/web.response';
import { ResponseUserDto } from './dto/response-user.dto';
import ConvertHelper from '../helper/convert.helper';
import { User } from '@prisma/client';
import { Public } from '../authentication/decorator/set-metadata.decorator';
import { SettingGeneralDataUserDto } from './dto/setting-general-data-user.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
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

  @Put('/settings/general-data')
  @UseInterceptors(FileInterceptor('photo'))
  async settingGeneralData(
    @Body() settingGeneralDataUserDto: SettingGeneralDataUserDto,
    @CurrentUser() loggedUser: LoggedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 10 * 10 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    photoFile: Express.Multer.File,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.userService.settingGeneralData(
          settingGeneralDataUserDto,
          loggedUser,
          photoFile,
        ),
      },
    };
  }
}
