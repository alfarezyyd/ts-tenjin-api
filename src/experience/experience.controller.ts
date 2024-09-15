import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { ResponseExperienceDto } from './dto/response-experience.dto';

@Controller('experiences')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('experienceResources'))
  async create(
    @UploadedFiles() experienceResources: Array<Express.Multer.File>,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.experienceService.create(
          experienceResources,
          createExperienceDto,
        ),
      },
    };
  }

  @Get()
  async findAllByMentor(
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<ResponseExperienceDto[]>> {
    return {
      result: {
        data: await this.experienceService.findAllByMentor(currentUser),
      },
    };
  }

  @Get('enums/employment-types')
  async fetchEmploymentTypeEnum() {
    return {
      result: {
        data: await this.experienceService.employmentTypeEnum(),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experienceService.findOne(+id);
  }

  @Put(':experienceId')
  @UseInterceptors(FilesInterceptor('experienceResources'))
  async update(
    @Param('experienceId', ParseIntPipe) experienceId: bigint,
    @UploadedFiles() experienceResources: Array<Express.Multer.File>,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.experienceService.update(
          experienceId,
          experienceResources,
          updateExperienceDto,
        ),
      },
    };
  }

  @Delete(':experienceId')
  async remove(
    @Param('experienceId') experienceId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.experienceService.remove(experienceId),
      },
    };
  }
}
