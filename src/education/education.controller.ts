import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { ResponseExperienceDto } from '../experience/dto/response-experience.dto';
import ResponseEducationDto from './dto/response-education.dto';

@Controller('educations')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post()
  async create(
    @Body() createEducationDto: CreateEducationDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.educationService.create(createEducationDto),
      },
    };
  }

  @Get()
  async findAllByMentor(
    @CurrentUser() loggedUser: LoggedUser,
  ): Promise<WebResponse<ResponseEducationDto[]>> {
    return {
      result: {
        data: await this.educationService.findAllByMentor(loggedUser),
      },
    };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() loggedUser: LoggedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return {
      result: {
        data: await this.educationService.findOne(loggedUser, +id),
      },
    };
  }

  @Put(':id')
  async update(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() updateEducationDto: UpdateEducationDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.educationService.update(
          loggedUser,
          updateEducationDto,
          id,
        ),
      },
    };
  }

  @Delete(':educationId')
  async remove(@Param('educationId') educationId: bigint) {
    return {
      result: {
        data: await this.educationService.remove(educationId),
      },
    };
  }
}
