import { HttpException, Injectable } from '@nestjs/common';
import CreateOrderDto from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { OrderValidation } from './order.validation';
import { Product } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const validatedCreateOrderDto = await this.validationService.validate(
      OrderValidation.SAVE,
      createOrderDto,
    );

    const productsId: bigint[] = createOrderDto.productsOrdersDto.map(
      (productOrder) => productOrder.productId,
    );
    const productsPrisma: Product[] = await this.prismaService.product.findMany(
      {
        where: {
          id: {
            in: productsId,
          },
        },
      },
    );
    if (productsPrisma.length !== productsId.length) {
      throw new HttpException("Some product doesn't exist", 404);
    }
    const productMap = new Map<bigint, Product>();
    productsPrisma.forEach((product) => {
      productMap.set(product.id, product);
    });

    let totalPrice = 0;
    createOrderDto.productsOrdersDto.forEach((productOrderDto) => {
      const productPrisma = productMap.get(productOrderDto.productId);
      if (productPrisma) {
        productOrderDto.subTotalPrice =
          productOrderDto.quantity * productPrisma.price;
        totalPrice += productOrderDto.subTotalPrice;
      }
    });

    await this.prismaService.order.create({
      data: {
        paymentMethod: validatedCreateOrderDto.paymentMethod,
        address: {
          connect: validatedCreateOrderDto.addressId,
        },
        expedition: {
          connect: validatedCreateOrderDto.expeditionId,
        },
        totalPrice: totalPrice,
      },
    });
    await this.prismaService.productOrder.createMany({
      data: validatedCreateOrderDto.productsOrdersDto,
    });
    return 'Success! new order has been created';
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
