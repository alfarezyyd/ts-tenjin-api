import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
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
  async create(
    @UploadedFiles()
    files: RegisterMentorResourceDto,
    @Body() registerMentorDto: RegisterMentorDto,
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<string>> {
    console.log(registerMentorDto, files);
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

  @Get()
  findAll() {
    return this.mentorService.findAll();
  }

  @Get(':mentorId')
  findOne(@Param('mentorId', ParseIntPipe) mentorId: bigint) {
    return this.mentorService.findOne(mentorId);
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
