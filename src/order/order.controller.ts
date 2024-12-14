import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WebResponse } from '../model/web.response';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { Assistance, Order } from '@prisma/client';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { PaymentNotificationDto } from './dto/payment-notification.dto';

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

  @Public()
  @Post('notifications')
  async paymentNotification(
    @Body() paymentNotificationPayload: PaymentNotificationDto,
  ) {
    await this.orderService.handlePaymentNotification(
      paymentNotificationPayload,
    );
  }

  @Get('schedule/:mentorId')
  async getOrderSchedule(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @CurrentUser() currentUser: LoggedUser,
  ) {
    return {
      result: {
        data: await this.orderService.fetchOrderSchedule(mentorId, currentUser),
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

  @Post('invoice')
  async generateInvoice(
    @CurrentUser() currentUser: LoggedUser,
    @Body() invoicePayload: { transactionToken: string },
  ) {
    await this.orderService.handleInvoiceOperation(
      currentUser,
      invoicePayload.transactionToken,
    );
  }

  @Get(':transactionToken')
  async findOne(@Param('transactionToken') id: string) {
    return {
      result: {
        data: await this.orderService.findOne(id),
      },
    };
  }

  @Get('finished/:orderId')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @CurrentUser() loggedUser: LoggedUser,
  ) {
    return {
      result: {
        data: await this.orderService.handleUpdateFinishedOrder(
          orderId,
          loggedUser,
        ),
      },
    };
  }
}
