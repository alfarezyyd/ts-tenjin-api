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
import { Assistance, Order, User } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import { MidtransCreateOrderDtoBuilder } from './dto/midtrans-create-order.dto';

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly midtransService: MidtransService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const validatedCreateOrderDto = this.validationService.validate(
      OrderValidation.SAVE,
      createOrderDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const assistancePrisma: Assistance = await prismaTransaction.assistance
        .findFirstOrThrow({
          where: {
            id: validatedCreateOrderDto.assistanceId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Assistance with assistance ${createOrderDto.assistanceId} not found`,
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
          uniqueId: this.expressRequest['user']['id'],
        },
      });
      const createOrderPayload: Order = {
        ...validatedCreateOrderDto,
        totalPrice:
          validatedCreateOrderDto.minutesDurations * assistancePrisma.price,
        userId: userPrisma.id,
        createdAt: new Date(),
      };
      const newCreatedOrder: Order = await prismaTransaction.order.create({
        data: {
          ...createOrderPayload,
        },
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
      await this.midtransService
        .getSnapTransaction()
        .createTransaction(midtransCreateOrderPayload)
        .then(async (transactionResponse: { token: any; id: any }) => {
          const transactionToken = transactionResponse.token;
          await prismaTransaction.order.update({
            data: {
              transactionToken: transactionToken,
            },
            where: {
              id: newCreatedOrder.id,
            },
          });
        })
        .catch(() => {
          throw new HttpException(`Error when trying to init payment`, 500);
        });
    });
    return 'This action adds a new order';
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
