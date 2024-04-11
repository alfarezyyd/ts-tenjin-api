import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OrderService } from './order.service';
import CreateOrderDto from './dto/create-order.dto';
import { WebResponse } from '../model/web.response';
import ResponseOrderDto from './dto/response-order.dto';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.orderService.create(createOrderDto),
      },
    };
  }

  @Get(':userId/:orderId')
  async findOne(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('orderId', ParseIntPipe) orderId: bigint,
  ): Promise<WebResponse<ResponseOrderDto>> {
    return {
      result: {
        data: await this.orderService.findOne(userId, orderId),
      },
    };
  }
}
