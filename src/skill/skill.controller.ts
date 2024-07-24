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
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post(':mentorId')
  create(
    @Param('mentorId', ParseIntPipe) mentorId: bigint,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillService.create(mentorId, createSkillDto);
  }

  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @Patch(':mentorId')
  update(
    @Param('mentorId') mentorId: bigint,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillService.update(mentorId, updateSkillDto);
  }

  @Delete(':skillId')
  remove(@Param('skillId', ParseIntPipe) skillId: bigint) {
    return this.skillService.remove(skillId);
  }
}
