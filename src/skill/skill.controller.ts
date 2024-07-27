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
  findAll() {
    return this.skillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @Put('skillId')
  update(
    @Param('skillId') skillId: bigint,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillService.update(skillId, updateSkillDto);
  }

  @Delete(':skillId')
  remove(@Param('skillId', ParseIntPipe) skillId: bigint) {
    return this.skillService.remove(skillId);
  }
}
