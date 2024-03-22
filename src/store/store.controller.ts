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
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { WebResponse } from '../model/web.response';

@Controller('store')
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

  @Get(':userId/:storeId')
  async findOne(
    @Param('userId') userId: bigint,
    @Param('storeId') storeId: bigint,
  ) {
    return this.storeService.findOne(userId, storeId);
  }

  @Patch(':userId/:storeId')
  async update(
    @Param('userId') userId: bigint,
    @Param('storeId') storeId: bigint,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.storeService.update(userId, storeId, updateStoreDto),
    };
  }

  @Delete('userId/:storeId')
  async remove(
    @Param('userId') userId: bigint,
    @Param('storeId') storeId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.storeService.remove(userId, storeId),
    };
  }
}
