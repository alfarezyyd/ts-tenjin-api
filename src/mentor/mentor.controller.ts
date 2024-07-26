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
  Req,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { WebResponse } from '../model/web.response';
import { Request } from 'express';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @HttpCode(201)
  async create(@Req() expressRequest: Request): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.mentorService.create(expressRequest['user']['id']),
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return this.mentorService.update(+id, updateMentorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentorService.remove(+id);
  }
}
