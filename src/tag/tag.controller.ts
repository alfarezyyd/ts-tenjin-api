import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    iconFile: Express.Multer.File,
    @Body() createTagDto: CreateTagDto,
  ) {
    return this.tagService.create(iconFile, createTagDto);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':tagId')
  @UseInterceptors(FileInterceptor('icon'))
  update(
    @Param('tagId', ParseIntPipe) tagId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    iconFile: Express.Multer.File,
    @Body()
    updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(tagId, iconFile, updateTagDto);
  }

  @Delete(':tagId')
  remove(@Param('tagId', ParseIntPipe) tagId: number) {
    return this.tagService.remove(tagId);
  }
}
