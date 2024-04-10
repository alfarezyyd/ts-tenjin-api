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

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get(':userId/:orderId')
  findOne(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('orderId', ParseIntPipe) orderId: bigint,
  ) {
    return this.orderService.findOne(userId, orderId);
  }
}
