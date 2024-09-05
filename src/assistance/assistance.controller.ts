import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';
import { WebResponse } from '../model/web.response';
import { Category, Language, Tag } from '@prisma/client';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('assistants')
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  @Get('create')
  async create(): Promise<
    WebResponse<{
      languages: Language[];
      categories: Category[];
      tags: Tag[];
    }>
  > {
    return {
      result: {
        data: await this.assistanceService.create(),
      },
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('images'))
  async store(
    @Body() createAssistanceDto: CreateAssistanceDto,
    @UploadedFiles() assistanceResources: Array<Express.Multer.File>,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.assistanceService.store(
          createAssistanceDto,
          assistanceResources,
        ),
      },
    };
  }

  @Public()
  @Get()
  async findAll() {
    return {
      result: {
        data: await this.assistanceService.findAll(),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assistanceService.findOne(+id);
  }

  @Patch(':assistanceId')
  async update(
    @Param('assistanceId') assistanceId: bigint,
    @Body() updateAssistanceDto: UpdateAssistanceDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.assistanceService.update(
          assistanceId,
          updateAssistanceDto,
        ),
      },
    };
  }

  @Delete(':assistanceId')
  async remove(@Param('assistanceId') assistanceId: bigint) {
    return {
      result: {
        message: await this.assistanceService.remove(assistanceId),
      },
    };
  }
}
