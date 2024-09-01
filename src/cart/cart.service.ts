import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { REQUEST } from '@nestjs/core';
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
          include: {
            Cart: {
              select: {
                id: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with unique id ${userUniqueId} not found`,
          );
        });

      await prismaTransaction.assistanceCart.create({
        data: {
          assistanceId: assistanceId,
          cartId: userPrisma.id,
          sessionAmount: 1,
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

  async update(updateCartDto: UpdateCartDto) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userUniqueId = this.expressRequest['user']['uniqueId'];
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: userUniqueId,
          },
          select: {
            Cart: {
              select: {
                id: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `User with unique id ${userUniqueId} not found`,
          );
        });
      const assistanceCart =
        await prismaTransaction.assistanceCart.findFirstOrThrow({
          where: {
            assistanceId: updateCartDto.assistanceId,
            cartId: userPrisma.Cart.id,
          },
          select: {
            sessionAmount: true,
          },
        });
      updateCartDto.cartMethod
        ? assistanceCart.sessionAmount++
        : assistanceCart.sessionAmount--;
      if (assistanceCart.sessionAmount <= 0) {
        await prismaTransaction.assistanceCart.deleteMany({
          where: {
            assistanceId: updateCartDto.assistanceId,
            cartId: userPrisma.Cart.id,
          },
        });
        return `Success! assistance  has been removed from cart`;
      }
      await prismaTransaction.assistanceCart.updateMany({
        where: {
          assistanceId: updateCartDto.assistanceId,
          cartId: userPrisma.Cart.id,
        },
        data: {
          sessionAmount: assistanceCart.sessionAmount,
        },
      });
      return `Success! assistance in cart has been updated successfully`;
    });
  }

  remove(assistanceId: bigint) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: this.expressRequest['user']['uniqueId'],
          },
          select: {
            Cart: {
              select: {
                id: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException(`Failed! user not found`);
        });
      await prismaTransaction.assistanceCart
        .findFirstOrThrow({
          where: {
            assistanceId: assistanceId,
            cartId: userPrisma.Cart.id,
          },
        })
        .cart(() => {
          throw new NotFoundException(`Failed! assistance not found cart`);
        });
      await prismaTransaction.assistanceCart.deleteMany({
        where: {
          cartId: userPrisma.Cart.id,
          assistanceId: assistanceId,
        },
      });
      return `Success! assistance has been removed from cart`;
    });
  }
}
