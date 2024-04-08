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
import { ResponseExpeditionDto } from './dto/response-expedition.dto';

@Controller('expedition')
export class ExpeditionController {
  constructor(private readonly expeditionService: ExpeditionService) {}

  @Post()
  async create(
    @Body() createExpeditionDto: CreateExpeditionDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.expeditionService.create(createExpeditionDto),
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<ResponseExpeditionDto[]>> {
    const allResponseExpedition = await this.expeditionService.findAll();
    return {
      data: allResponseExpedition,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<ResponseExpeditionDto>> {
    return {
      data: await this.expeditionService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpeditionDto: UpdateExpeditionDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.expeditionService.update(id, updateExpeditionDto),
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.expeditionService.remove(id),
    };
  }
}
