import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { WebResponse } from '../model/web.response';
import {
  RegisterMentorDto,
  RegisterMentorResourceDto,
} from './dto/register-mentor.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { NoVerifiedEmail } from '../authentication/decorator/set-no-verified-email.decorator';
import { ResponseAuthenticationDto } from '../authentication/dto/response-authentication';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'curriculumVitae', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'identityCard', maxCount: 1 },
    ]),
  )
  @NoVerifiedEmail(true)
  async create(
    @UploadedFiles()
    files: RegisterMentorResourceDto,
    @Body() registerMentorDto: RegisterMentorDto,
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.mentorService.create(
          files,
          currentUser,
          registerMentorDto,
        ),
      },
    };
  }

  @Public()
  @Get(':uniqueId')
  async findOne(
    @Param('uniqueId') uniqueId: string,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.findOne(uniqueId),
      },
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return this.mentorService.update(+id, updateMentorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorService.remove(+id);
  }
}
