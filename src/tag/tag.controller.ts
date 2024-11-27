import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../model/web.response';
import { Public } from '../authentication/decorator/set-metadata.decorator';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000 * 100 })],
      }),
    )
    iconFile: Express.Multer.File,
    @Body() createTagDto: CreateTagDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.tagService.create(iconFile, createTagDto),
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
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('tagId', ParseIntPipe) tagId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 100 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    iconFile: Express.Multer.File,
    @Body()
    updateTagDto: UpdateTagDto,
  ) {
    return {
      result: {
        message: await this.tagService.update(tagId, iconFile, updateTagDto),
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
