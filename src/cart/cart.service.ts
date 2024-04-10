import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import ResponseProductCartDto from './dto/response-product-cart.dto';
import ConvertHelper from '../helper/convert.helper';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(userId: bigint): Promise<void> {
    await this.prismaService.cart.create({
      data: {
        userId: userId,
      },
    });
  }

  async findAllProductByCartId(
    cartId: bigint,
  ): Promise<ResponseProductCartDto[]> {
    const productsCarts = await this.prismaService.productsCarts.findMany({
      where: {
        cartId: cartId,
      },
      include: {
        product: true,
      },
    });
    const responsesProductCartDto: ResponseProductCartDto[] = [];
    for (const productOnCart of productsCarts) {
      responsesProductCartDto.push(
        await ConvertHelper.productCartPrismaIntoProductCartResponse(
          productOnCart,
        ),
      );
    }
    return responsesProductCartDto;
  }

  async detachProductFromCart(cartId: bigint, productId: bigint) {
    const productsCartsPrisma = await this.prismaService.productsCarts.delete({
      where: {
        productId_cartId: {
          productId: productId,
          cartId: cartId,
        },
      },
    });
    if (productsCartsPrisma == null) {
      throw new HttpException(`Products `, 404);
    }
    return `Product successfully deleted from cart`;
  }

  async appendProductIntoCart(createProductCartDto: CreateProductCartDto) {
    const productPrice = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          id: createProductCartDto.productId,
        },
        select: {
          price: true,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 404);
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
  }
}
