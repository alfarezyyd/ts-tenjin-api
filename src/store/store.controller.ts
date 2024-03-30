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
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { WebResponse } from '../model/web.response';
import { ResponseStoreDto } from './dto/response-store.dto';

@Controller('api/stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post(':userId')
  async create(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.storeService.create(userId, createStoreDto),
    };
  }

  @Get(':userId')
  async findOne(
    @Param('userId') userId: bigint,
  ): Promise<WebResponse<ResponseStoreDto>> {
    return {
      data: await this.storeService.findOne(userId),
    };
  }

  @Put(':userId')
  async update(
    @Param('userId') userId: bigint,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.storeService.update(userId, updateStoreDto),
    };
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: bigint): Promise<WebResponse<string>> {
    return {
      data: await this.storeService.remove(userId),
    };
  }
}
