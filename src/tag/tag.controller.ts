import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { WebResponse } from '../model/web.response';
import { Public } from '../authentication/decorator/set-metadata.decorator';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  async create(
    @Body() createTagDto: CreateTagDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.tagService.create(createTagDto),
      },
    };
  }

  @Public()
  @Get()
  async findAll() {
    return {
      result: {
        data: await this.tagService.findAll(),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Put(':tagId')
  async update(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return {
      result: {
        message: await this.tagService.update(tagId, updateTagDto),
      },
    };
  }

  @Delete(':tagId')
  async remove(@Param('tagId', ParseIntPipe) tagId: number) {
    return {
      result: {
        message: await this.tagService.remove(tagId),
      },
    };
  }
}
