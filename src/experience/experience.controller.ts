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
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post(':mentorId')
  create(
    @Param('mentorId', ParseIntPipe) mentorId: bigint,
    @Body() createExperienceDto: CreateExperienceDto,
  ) {
    return this.experienceService.create(mentorId, createExperienceDto);
  }

  @Get()
  findAll() {
    return this.experienceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experienceService.findOne(+id);
  }

  @Patch(':mentorId')
  update(
    @Param('mentorId') mentorId: bigint,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    return this.experienceService.update(mentorId, updateExperienceDto);
  }

  @Delete(':mentorId/:experienceId')
  remove(
    @Param('mentorId') mentorId: bigint,
    @Param('experienceId') experienceId: bigint,
  ) {
    return this.experienceService.remove(mentorId, experienceId);
  }
}
