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
  Invoice,
  Order,
  OrderPaymentStatus,
  OrderStatus,
  PaymentType,
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

  findOne(transactionToken: string) {
    return this.prismaService.order.findFirstOrThrow({
      where: {
        transactionToken,
      },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
        assistance: true,
      },
    });
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

  async handleInvoiceOperation(
    currentUser: LoggedUser,
    transactionToken: string,
  ) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const orderPrisma: Order = await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            transactionToken: transactionToken,
          },
        })
        .catch(() => {
          throw new NotFoundException('Order not found');
        });
      const assistancePrisma = await prismaTransaction.assistance
        .findFirstOrThrow({
          where: {
            id: orderPrisma.assistantId,
          },
        })
        .catch(() => {
          throw new NotFoundException('Assistance not found');
        });
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: currentUser.uniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      const invoicePrisma: Invoice = await prismaTransaction.invoice.create({
        data: {
          orderId: orderPrisma.id,
          userId: userPrisma.id,
          assistantId: orderPrisma.assistantId,
          dueDate: new Date(),
          invoiceDate: new Date(),
          paymentType: PaymentType.PAYMENT_LINK,
          note: orderPrisma.note,
        },
      });
      const invoicePayload = {
        order_id: orderPrisma.id,
        invoice_number: invoicePrisma.id,
        due_date: invoicePrisma.dueDate,
        invoice_date: invoicePrisma.invoiceDate,
        customer_details: {
          id: userPrisma.uniqueId,
          name: userPrisma.name,
          email: userPrisma.email,
          phone: userPrisma.telephone,
        },
        payment_type: invoicePrisma.paymentType.toString().toLowerCase(),
        item_details: [
          {
            item_id: assistancePrisma.id,
            description: assistancePrisma.topic,
            quantity: 1,
            price: orderPrisma.totalPrice,
          },
        ],
        notes: invoicePrisma.note,
      };
    });
  }

  async handleUpdateFinishedOrder(orderId: string, loggedUser: LoggedUser) {
    this.prismaService.$transaction(async (prismaTransaction) => {
      const orderPrisma: Order = await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            user: {
              uniqueId: loggedUser.uniqueId,
            },
            id: orderId,
            orderStatus: {
              not: OrderStatus.FINISHED,
            },
          },
        })
        .catch(() => {
          throw new NotFoundException('Order not found');
        });
      await prismaTransaction.order.update({
        where: {
          user: {
            uniqueId: loggedUser.uniqueId,
          },
          id: orderId,
        },
        data: {
          orderStatus: OrderStatus.FINISHED,
        },
      });
      const mentorPrisma = await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: orderPrisma.mentorId,
          },
          include: {
            user: {
              select: {
                totalBalance: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException('Mentor not found');
        });
      await prismaTransaction.user.update({
        where: {
          id: mentorPrisma.userId,
        },
        data: {
          totalBalance:
            mentorPrisma.user.totalBalance +
            BigInt(Math.round(orderPrisma.totalPrice.toNumber())),
        },
      });
    });
  }
}
