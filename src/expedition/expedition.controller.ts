import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpeditionService } from './expedition.service';
import { CreateExpeditionDto } from './dto/create-expedition.dto';
import { UpdateExpeditionDto } from './dto/update-expedition.dto';
import { WebResponse } from '../model/web.response';
import ResponseExpeditionDto from './dto/response-expedition.dto';

@Controller('api/expeditions')
export class ExpeditionController {
  constructor(private readonly expeditionService: ExpeditionService) {}

  @Post()
  async create(
    @Body() createExpeditionDto: CreateExpeditionDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.expeditionService.create(createExpeditionDto),
      },
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<ResponseExpeditionDto[]>> {
    const allResponseExpeditionDto: ResponseExpeditionDto[] =
      await this.expeditionService.findAll();
    return {
      result: {
        data: allResponseExpeditionDto,
      },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<ResponseExpeditionDto>> {
    return {
      result: {
        data: await this.expeditionService.findOne(id),
      },
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpeditionDto: UpdateExpeditionDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.expeditionService.update(id, updateExpeditionDto),
      },
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.expeditionService.remove(id),
      },
    };
  }
}
