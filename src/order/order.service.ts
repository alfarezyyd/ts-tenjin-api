import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { MidtransService } from '../common/midtrans.service';
import { OrderValidation } from './order.validation';
import {
  Assistance,
  Order,
  OrderPaymentStatus,
  OrderStatus,
  User,
} from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import { MidtransCreateOrderDtoBuilder } from './dto/midtrans-create-order.dto';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { PaymentNotificationDto } from './dto/payment-notification.dto';
import { HttpService } from '@nestjs/axios';

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly midtransService: MidtransService,
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<string> {
    console.log(this.expressRequest['user']);
    const validatedCreateOrderDto = this.validationService.validate(
      OrderValidation.SAVE,
      createOrderDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const assistancePrisma: Assistance = await prismaTransaction.assistance
        .findFirstOrThrow({
          where: {
            id: validatedCreateOrderDto.assistanceId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Assistance with assistance ${createOrderDto.assistantId} not found`,
          );
        });
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: validatedCreateOrderDto.mentorId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Mentor with mentorId ${validatedCreateOrderDto.mentorId} not found`,
          );
        });
      const userPrisma: User = await prismaTransaction.user.findFirstOrThrow({
        where: {
          uniqueId: this.expressRequest['user']['uniqueId'],
        },
      });

      const createOrderPayload: Order = {
        ...validatedCreateOrderDto,
        totalPrice:
          validatedCreateOrderDto.sessionCount * assistancePrisma.price,
        userId: userPrisma.id,
        createdAt: new Date(),
      };
      console.log(createOrderPayload);
      delete createOrderPayload['sessionCount'];
      const newCreatedOrder: Order = await prismaTransaction.order.create({
        data: createOrderPayload,
      });
      const [firstName, ...partedLastName] = userPrisma.name.split(' ');
      const lastName = partedLastName.join(' ');

      const midtransCreateOrderPayload = new MidtransCreateOrderDtoBuilder()
        .setTransactionDetails(
          newCreatedOrder.id,
          createOrderPayload.totalPrice,
        )
        .setCreditCard(true)
        .setCustomerDetails(
          firstName,
          lastName,
          userPrisma.email,
          userPrisma.telephone,
        )
        .build();
      const transactionResponse = await this.midtransService
        .getSnapTransaction()
        .createTransaction(midtransCreateOrderPayload);

      const transactionToken = transactionResponse.token;
      await prismaTransaction.order
        .update({
          data: {
            transactionToken: transactionToken,
          },
          where: {
            id: newCreatedOrder.id,
          },
        })
        .catch(() => {
          throw new HttpException(`Error when trying to init payment`, 500);
        });
      return transactionToken;
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async findAllByUserId(loggedUser: LoggedUser): Promise<
    (Order & {
      assistance: Assistance;
    })[]
  > {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with unique id ${loggedUser.uniqueId} not found`,
          );
        });

      return prismaTransaction.order.findMany({
        where: {
          userId: userPrisma.id,
        },
        include: {
          assistance: {
            include: {
              category: true,
              mentor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async handlePaymentNotification(
    paymentNotificationPayload: PaymentNotificationDto,
  ) {
    this.prismaService.$transaction(async (prismaTransaction) => {
      switch (paymentNotificationPayload.transaction_status) {
        case 'settlement':
          await prismaTransaction.order.updateMany({
            where: {
              id: paymentNotificationPayload.order_id,
            },
            data: {
              orderStatus: OrderStatus.FINISHED,
              orderPaymentStatus: OrderPaymentStatus.PAID,
            },
          });
          break;
        case 'cancel':
        case 'deny':
        case 'expire':
          await prismaTransaction.order.updateMany({
            where: {
              id: paymentNotificationPayload.order_id,
            },
            data: {
              orderStatus: OrderStatus.CANCELLED,
              orderPaymentStatus: OrderPaymentStatus.NOT_YET_PAID,
            },
          });
          break;
        case 'pending':
          await prismaTransaction.order.updateMany({
            where: {
              id: paymentNotificationPayload.order_id,
            },
            data: {
              orderStatus: OrderStatus.PROCESSED,
              orderPaymentStatus: OrderPaymentStatus.NOT_YET_PAID,
            },
          });
          break;
        default:
          break;
      }
    });
  }

  async handleInvoiceOperation(transactionToken: string) {
    console.log(transactionToken);
    this.httpService.post(
      `${this.configService.get<string>('MIDTRANS_ENDPOINT')}/invoices`,
    );
  }
}
