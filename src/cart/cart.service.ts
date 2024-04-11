import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import ResponseProductCartDto from './dto/response-product-cart.dto';
import ConvertHelper from '../helper/convert.helper';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async findAllProductByCartId(
    cartId: bigint,
  ): Promise<ResponseProductCartDto[]> {
    const allProductInCart = await this.prismaService.productsCarts.findMany({
      where: {
        cartId: cartId,
      },
      include: {
        product: true,
      },
    });
    const allResponseProductCartDto: ResponseProductCartDto[] = [];
    for (const productInCart of allProductInCart) {
      allResponseProductCartDto.push(
        await ConvertHelper.productCartPrismaIntoProductCartResponse(
          productInCart,
        ),
      );
    }
    return allResponseProductCartDto;
  }

  async detachProductFromCart(cartId: bigint, productId: bigint) {
    const productCartPrisma = await this.prismaService.productsCarts.delete({
      where: {
        productId_cartId: {
          productId: productId,
          cartId: cartId,
        },
      },
    });
    if (productCartPrisma == null) {
      throw new HttpException(
        `Product with id ${productId} in cart with id ${cartId} not found`,
        404,
      );
    }
    return `Product with id ${productId} successfully deleted from cart with id ${cartId}`;
  }

  async attachProductIntoCart(
    createProductCartDto: CreateProductCartDto,
  ): Promise<string> {
    const productPrice = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          id: createProductCartDto.productId,
        },
        select: {
          price: true,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Product with productId ${createProductCartDto.productId} not found`,
          404,
        );
      });

    await this.prismaService.productsCarts
      .findFirstOrThrow({
        where: {
          cartId: createProductCartDto.cartId,
        },
        select: {
          cartId: true,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Cart with cartId ${createProductCartDto.cartId} not found`,
          404,
        );
      });

    await this.prismaService.productsCarts.create({
      data: {
        quantity: createProductCartDto.quantity,
        price: createProductCartDto.quantity * productPrice.price,
        product: {
          connect: { id: createProductCartDto.productId },
        },
        cart: {
          connect: { id: createProductCartDto.cartId },
        },
      },
    });
    return `Success! attach product with productId ${createProductCartDto.productId} into cart with cartId ${createProductCartDto.cartId}`;
  }
}
