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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WebResponse } from '../model/web.response';
import { Mentor, User } from '@prisma/client';
import { Public } from '../authentication/decorator/set-metadata.decorator';
import { SettingGeneralDataUserDto } from './dto/setting-general-data-user.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { NoVerifiedEmail } from '../authentication/decorator/set-no-verified-email.decorator';
import { ChangePassword } from './dto/change-password.dto';
import ConvertHelper from '../helper/convert.helper';
import { ResponseAuthenticationDto } from '../authentication/dto/response-authentication';
import { SettingMentorInformationDto } from './dto/setting-mentor-information.dto';

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
  @NoVerifiedEmail(true)
  async findOne(@Param('userId') userId: string): Promise<WebResponse<any>> {
    const userDetail: User = await this.userService.findOne(userId);
    return {
      result: {
        data: await ConvertHelper.userPrismaIntoUserResponse(userDetail),
      },
    };
  }

  @Get('specific/:userId')
  @NoVerifiedEmail(true)
  async findOneSpecific(
    @Param('userId') userId: string,
  ): Promise<WebResponse<any>> {
    const userDetail: User & { Mentor?: Mentor | null } =
      await this.userService.findOne(userId);
    const userSpecificSchedule =
      await this.userService.handleFindOneSpecific(userDetail);
    const mergedObject = {
      userDetail,
      userSpecificSchedule,
    };

    return {
      result: {
        data: mergedObject,
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
  @NoVerifiedEmail(true)
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
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.userService.settingGeneralData(
          settingGeneralDataUserDto,
          loggedUser,
          photoFile,
        ),
      },
    };
  }

  @Put('/settings/change-password')
  async settingChangePassword(
    @Body() changePassword: ChangePassword,
    @CurrentUser() loggedUser: LoggedUser,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.userService.handleChangePassword(
          changePassword,
          loggedUser,
        ),
      },
    };
  }

  @Put('/settings/mentor-information')
  @UseInterceptors(FilesInterceptor('photo'))
  async settingMentorInformation(
    @Body() settingMentorInformation: SettingMentorInformationDto,
    @CurrentUser() loggedUser: LoggedUser,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 10 * 10 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    photoFile: Array<Express.Multer.File>,
  ): Promise<WebResponse<boolean>> {
    console.log(settingMentorInformation, photoFile);
    return {
      result: {
        data: await this.userService.settingMentorInformation(
          settingMentorInformation,
          loggedUser,
          photoFile,
        ),
      },
    };
  }
}
