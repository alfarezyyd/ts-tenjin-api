import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../model/web.response';
import { Public } from 'src/authentication/set-metadata.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 10 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    logoFile: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.categoryService.create(logoFile, createCategoryDto),
      },
    };
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Put(':categoryId')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 10 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    logoFile: Express.Multer.File,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.categoryService.update(
          categoryId,
          logoFile,
          updateCategoryDto,
        ),
      },
    };
  }

  @Delete(':categoryId')
  async remove(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.categoryService.remove(categoryId),
      },
    };
  }
}
