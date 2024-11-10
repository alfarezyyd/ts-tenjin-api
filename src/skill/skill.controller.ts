import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { WebResponse } from '../model/web.response';
import ResponseSkillDto from './dto/response-skill.dto';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  async create(@Body() createSkillDto: CreateSkillDto) {
    return {
      result: {
        message: await this.skillService.create(createSkillDto),
      },
    };
  }

  @Get()
  async findAllByMentor(): Promise<WebResponse<ResponseSkillDto[]>> {
    return {
      result: {
        data: await this.skillService.findAll(),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @Put(':skillId')
  async update(
    @Param('skillId') skillId: bigint,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return {
      result: {
        data: await this.skillService.update(skillId, updateSkillDto),
      },
    };
  }

  @Delete(':skillId')
  async remove(@Param('skillId', ParseIntPipe) skillId: bigint) {
    return {
      result: {
        data: await this.skillService.remove(skillId),
      },
    };
  }
}
