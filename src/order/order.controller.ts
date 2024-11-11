import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WebResponse } from '../model/web.response';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { Assistance, Order } from '@prisma/client';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.orderService.create(createOrderDto),
      },
    };
  }

  @Get()
  async findAllByUserId(@CurrentUser() loggedUser: LoggedUser): Promise<
    WebResponse<
      (Order & {
        assistance: Assistance;
      })[]
    >
  > {
    return {
      result: {
        data: await this.orderService.findAllByUserId(loggedUser),
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }
}
