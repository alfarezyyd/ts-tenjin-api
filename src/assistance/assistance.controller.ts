import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';
import { WebResponse } from '../model/web.response';
import { Category, Language, Tag } from '@prisma/client';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResponseAssistanceDto } from './dto/response-assistance.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';

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
  @UseInterceptors(FilesInterceptor('images'))
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
  async findAll(): Promise<WebResponse<ResponseAssistanceDto[]>> {
    return {
      result: {
        data: await this.assistanceService.findAll(),
      },
    };
  }

  @Get('mentor')
  async findAllByMentor(
    @CurrentUser() loggedUser: LoggedUser,
  ): Promise<WebResponse<ResponseAssistanceDto[]>> {
    return {
      result: {
        data: await this.assistanceService.findAllByMentor(loggedUser),
      },
    };
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<ResponseAssistanceDto>> {
    const detailAssistance = await this.assistanceService.findOne(+id);
    return {
      result: {
        data: {
          ...detailAssistance,
          ratingAverage: detailAssistance.ratingAverage.toString(),
        },
      },
    };
  }

  @Put(':assistanceId')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('assistanceId') assistanceId: bigint,
    @Body() updateAssistanceDto: UpdateAssistanceDto,
    @UploadedFiles() assistanceResources: Array<Express.Multer.File>,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.assistanceService.update(
          assistanceId,
          updateAssistanceDto,
          assistanceResources,
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
