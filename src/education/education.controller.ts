import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
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
  findOne(@Param('id') id: string) {
    return this.educationService.findOne(+id);
  }

  @Put()
  update(@Body() updateEducationDto: UpdateEducationDto) {
    return this.educationService.update(updateEducationDto);
  }

  @Delete(':educationId')
  remove(@Param('educationId') educationId: bigint) {
    return this.educationService.remove(educationId);
  }
}
