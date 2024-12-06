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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebResponse } from '../model/web.response';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { Category } from '@prisma/client';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000 * 10 * 10 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    logoFile: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        message: await this.categoryService.create(logoFile, createCategoryDto),
      },
    };
  }

  @Public()
  @Get()
  async findAll(): Promise<WebResponse<Category[]>> {
    return {
      result: {
        data: await this.categoryService.findAll(),
      },
    };
  }

  @Public()
  @Get('/mentors')
  async findAllCategoryWithMentor() {
    return {
      result: {
        data: await this.categoryService.handleFindAllCategoryWithMentor(),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      result: {
        data: await this.categoryService.findOne(+id),
      },
    };
  }

  @Get('assistance/:id')
  @Public()
  async findAllByCategoryId(@Param('id', ParseIntPipe) id: number) {
    return {
      result: {
        data: await this.categoryService.findAllByCategory(id),
      },
    };
  }

  @Put(':categoryId')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() logoFile: Express.Multer.File,
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
