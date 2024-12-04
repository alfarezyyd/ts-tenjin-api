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
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { WebResponse } from '../model/web.response';
import { Language } from '@prisma/client';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.languageService.create(createLanguageDto),
      },
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<Language[]>> {
    return {
      result: {
        data: await this.languageService.findAll(),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return {
      result: {
        data: await this.languageService.update(id, updateLanguageDto),
      },
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(+id);
  }
}
