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

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Post(':mentorId')
  create(
    @Param('mentorId', ParseIntPipe) mentorId: bigint,
    @Body() createEducationDto: CreateEducationDto,
  ) {
    return this.educationService.create(mentorId, createEducationDto);
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
