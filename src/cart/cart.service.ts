import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { REQUEST } from '@nestjs/core';
import ResponseCartDto from './dto/response-cart.dto';
import ResponseCart from './dto/response-cart.dto';

@Injectable({ scope: Scope.REQUEST })
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(assistanceId: number) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userUniqueId = this.expressRequest['user']['uniqueId'];
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: userUniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with unique id ${userUniqueId} not found`,
          );
        });
      const cartPrisma = await prismaTransaction.cart
        .findFirstOrThrow({
          where: {
            userId: userPrisma.id,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Cart with user id ${userPrisma.id} not found`,
          );
        });
      await prismaTransaction.assistanceCart.create({
        data: {
          assistanceId: assistanceId,
          cartId: cartPrisma.id,
        },
      });
    });
    return 'Success! new assistance append into cart';
  }

  async findAll() {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userUniqueId = this.expressRequest['user']['uniqueId'];
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: userUniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with unique id ${userUniqueId} not found`,
          );
        });
      const cartPrisma = await prismaTransaction.cart
        .findFirstOrThrow({
          where: {
            userId: userPrisma.id,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Cart with user id ${userPrisma.id} not found`,
          );
        });
      const assistantsCart = await prismaTransaction.assistanceCart.findMany({
        where: {
          cartId: cartPrisma.id,
        },
        select: {
          sessionAmount: true,
          assistance: {
            select: {
              id: true,
              topic: true,
              price: true,
            },
          },
        },
      });
      const assistantsCartResponse: ResponseCart[] = [];
      for (const assistantsCartElement of assistantsCart) {
        const assistantCartResponse = new ResponseCart();
        assistantCartResponse.assistanceId =
          assistantsCartElement.assistance.id.toString();
        assistantCartResponse.assistanceTopic =
          assistantsCartElement.assistance.topic;
        assistantCartResponse.assistancePrice =
          assistantsCartElement.assistance.price;
        assistantCartResponse.sessionAmount =
          assistantsCartElement.sessionAmount;
        assistantsCartResponse.push(assistantCartResponse);
      }
      return assistantsCartResponse;
    });
  }
  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
