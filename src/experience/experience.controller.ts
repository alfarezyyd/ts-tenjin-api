import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Post(':mentorId')
  @UseInterceptors(FilesInterceptor('experienceResources'))
  create(
    @UploadedFiles() experienceResources: Array<Express.Multer.File>,
    @Param('mentorId', ParseIntPipe) mentorId: bigint,
    @Body() createExperienceDto: CreateExperienceDto,
  ) {
    return this.experienceService.create(
      experienceResources,
      mentorId,
      createExperienceDto,
    );
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
