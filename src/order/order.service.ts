import { HttpException, Injectable } from '@nestjs/common';
import CreateOrderDto from './dto/create-order.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { OrderValidation } from './order.validation';
import { Product } from '@prisma/client';
import ResponseOrderDto from './dto/response-order.dto';
import ProductOrderDto from './dto/product-order.dto';
import ConvertHelper from '../helper/convert.helper';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<string> {
    const validatedCreateOrderDto = await this.validationService.validate(
      OrderValidation.SAVE,
      createOrderDto,
    );
    const allProductId: bigint[] =
      validatedCreateOrderDto.productsOrdersDto.map(
        (productOrderDto: ProductOrderDto) => productOrderDto.productId,
      );
    const allProductPrisma: Product[] =
      await this.prismaService.product.findMany({
        where: {
          id: {
            in: allProductId,
          },
        },
      });
    if (allProductPrisma.length !== allProductId.length) {
      throw new HttpException("Some product doesn't exist", 404);
    }

    const productMap = new Map<bigint, Product>();
    allProductPrisma.forEach((productPrisma: Product) => {
      productMap.set(productPrisma.id, productPrisma);
    });
    let totalPrice = 0;
    for (const [
      index,
      productOrderDto,
    ] of validatedCreateOrderDto.productsOrdersDto.entries()) {
      const productPrisma: Product = productMap.get(
        BigInt(productOrderDto.productId),
      );
      if (productPrisma) {
        const subTotalPrice: number =
          productOrderDto.quantity * productPrisma.price;
        totalPrice += subTotalPrice;
        validatedCreateOrderDto.productsOrdersDto[index].subTotalPrice =
          subTotalPrice;
      }
    }

    const orderPrisma = await this.prismaService.order.create({
      data: {
        paymentMethod: validatedCreateOrderDto.paymentMethod,
        address: {
          connect: {
            id: validatedCreateOrderDto.addressId,
          },
        },
        expedition: {
          connect: {
            id: validatedCreateOrderDto.expeditionId,
          },
        },
        user: {
          connect: {
            id: validatedCreateOrderDto.userId,
          },
        },
        totalPrice: totalPrice,
      },
      select: {
        id: true,
      },
    });

    for (const [index] of validatedCreateOrderDto.productsOrdersDto.entries()) {
      validatedCreateOrderDto.productsOrdersDto[index].orderId = orderPrisma.id;
    }

    await this.prismaService.productOrder.createMany({
      data: validatedCreateOrderDto.productsOrdersDto,
    });
    return 'Success! new order has been created';
  }

  async findAllByUserId(userId: bigint): Promise<ResponseOrderDto[]> {
    const ordersPrisma = await this.prismaService.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        ProductOrder: true,
        expedition: true,
      },
    });
    const responseOrdersDto: ResponseOrderDto[] = [];
    for (const orderPrisma of ordersPrisma) {
      const responseOrderDto = new ResponseOrderDto();
      responseOrderDto.paymentMethod = orderPrisma.paymentMethod;
      const productsOrderDto: ProductOrderDto[] = [];
      for (const productOrderPrisma of orderPrisma.ProductOrder) {
        productsOrderDto.push(
          await ConvertHelper.productOrderPrismaIntoProductOrderDto(
            productOrderPrisma,
          ),
        );
        responseOrderDto.productsOrdersDto = productsOrderDto;
      }
      responseOrdersDto.push(responseOrderDto);
    }
    return responseOrdersDto;
  }

  async findOne(userId: bigint, orderId: bigint): Promise<ResponseOrderDto> {
    const orderPrisma = await this.prismaService.order
      .findFirstOrThrow({
        where: {
          id: orderId,
          userId: userId,
        },
        include: {
          address: true,
          expedition: true,
          ProductOrder: true,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Order with orderId ${orderId} and userId ${userId} not found`,
          404,
        );
      });
    return ConvertHelper.orderPrismaIntoOrderResponse(
      orderPrisma,
      orderPrisma.address,
      orderPrisma.expedition,
      orderPrisma.ProductOrder,
    );
  }
}
