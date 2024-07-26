import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { WebResponse } from '../model/web.response';

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
  findAll() {
    return this.educationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educationService.findOne(+id);
  }

  @Patch(':mentorId')
  update(
    @Param('mentorId', ParseIntPipe) mentorId: bigint,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(mentorId, updateEducationDto);
  }

  @Delete(':mentorId/:educationId')
  remove(
    @Param('mentorId') mentorId,
    @Param('educationId') educationId: bigint,
  ) {
    return this.educationService.remove(mentorId, educationId);
  }
}
