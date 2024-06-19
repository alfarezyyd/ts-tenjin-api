import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { WebResponse } from '../model/web.response';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Param('userId', ParseIntPipe) userId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.mentorService.create(userId),
      },
    };
  }

  @Get()
  findAll() {
    return this.mentorService.findAll();
  }

  @Get(':mentorId')
  findOne(@Param('mentorId', ParseIntPipe) mentorId: bigint) {
    return this.mentorService.findOne(mentorId);
  }
  1;

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return this.mentorService.update(+id, updateMentorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorService.remove(+id);
  }
}
