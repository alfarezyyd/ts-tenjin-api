import { ResponseUserDto } from '../user/dto/response-user.dto';
import {
  Address,
  Expedition,
  Order,
  Product,
  ProductOrder,
  Store,
  User,
} from '@prisma/client';
import { RefinementCtx, z } from 'zod';
import { ResponseStoreDto } from '../store/dto/response-store.dto';
import ResponseAddressDto from '../address/dto/response-address.dto';
import ResponseProductDto from '../product/dto/response-product.dto';
import ResponseExpeditionDto from '../expedition/dto/response-expedition.dto';
import ResponseProductCartDto from '../cart/dto/response-product-cart.dto';
import ProductOrderDto from '../order/dto/product-order.dto';
import ResponseOrderDto from '../order/dto/response-order.dto';

export default class ConvertHelper {
  static async productPrismaIntoProductResponse(
    productPrisma: Product,
  ): Promise<ResponseProductDto> {
    return {
      id: productPrisma.id.toString(),
      name: productPrisma.name,
      condition: productPrisma.condition,
      description: productPrisma.description,
      price: productPrisma.price,
      minimumOrder: productPrisma.minimumOrder,
      status: productPrisma.status,
      stock: productPrisma.stock,
      sku: productPrisma.sku,
      weight: productPrisma.weight,
      height: productPrisma.height,
      width: productPrisma.width,
    };
  }

  static async storePrismaIntoStoreResponse(
    storePrisma: Store,
  ): Promise<ResponseStoreDto> {
    return {
      id: storePrisma.id.toString(),
      name: storePrisma.name,
      domain: storePrisma.domain,
      slogan: storePrisma.slogan,
      locationName: storePrisma.locationName,
      city: storePrisma.city,
      zipCode: storePrisma.zipCode,
      detail: storePrisma.detail,
      description: storePrisma.description,
      photoPath: storePrisma.photoPath,
    };
  }

  static async userPrismaIntoUserResponse(
    userPrisma: User,
  ): Promise<ResponseUserDto> {
    return {
      id: userPrisma.id.toString(),
      name: userPrisma.name,
      gender: userPrisma.gender,
      email: userPrisma.email,
      telephone: userPrisma.telephone,
      pin: userPrisma.pin,
      photoPath: userPrisma.photoPath,
    };
  }

  static async addressPrismaIntoAddressResponse(
    addressPrisma: Address,
    expeditionCity: string,
    expeditionProvince: string,
  ): Promise<ResponseAddressDto> {
    return {
      id: addressPrisma.id.toString(),
      label: addressPrisma.label,
      street: addressPrisma.street,
      neighbourhoodNumber: addressPrisma.neighbourhoodNumber,
      hamletNumber: addressPrisma.hamletNumber,
      village: addressPrisma.village,
      urbanVillage: addressPrisma.urbanVillage,
      subDistrict: addressPrisma.subDistrict,
      expeditionCity: expeditionCity,
      expeditionProvince: expeditionProvince,
      postalCode: addressPrisma.postalCode,
      notes: addressPrisma.notes,
      receiverName: addressPrisma.receiverName,
      telephone: addressPrisma.telephone,
    };
  }

  static convertStringIntoEnum<T>(
    arg: string,
    ctx: RefinementCtx,
    msg: string,
    classEnum: T,
  ): string {
    if (!Object.values(classEnum).includes(arg.toUpperCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg,
      });
      return z.NEVER;
    } else {
      return arg.toUpperCase();
    }
  }

  static async expeditionPrismaIntoExpeditionResponse(
    expeditionPrisma: Expedition,
  ): Promise<ResponseExpeditionDto> {
    return {
      id: expeditionPrisma.id.toString(),
      name: expeditionPrisma.name,
    };
  }

  static async productCartPrismaIntoProductCartResponse(
    productOnCart: any,
  ): Promise<ResponseProductCartDto> {
    const responseProductCartDto: ResponseProductCartDto =
      new ResponseProductCartDto();
    responseProductCartDto.cartId = productOnCart.cartId.toString();
    responseProductCartDto.price = productOnCart.price;
    responseProductCartDto.quantity = productOnCart.quantity;
    responseProductCartDto.product =
      await ConvertHelper.productPrismaIntoProductResponse(
        productOnCart.product,
      );
    return responseProductCartDto;
  }

  static async productOrderPrismaIntoProductOrderDto(
    productOrderPrisma: ProductOrder,
  ): Promise<ProductOrderDto> {
    return {
      quantity: productOrderPrisma.quantity,
      orderId: productOrderPrisma.orderId,
      subTotalPrice: productOrderPrisma.subTotalPrice,
      productId: productOrderPrisma.productId,
      note: productOrderPrisma.note,
    };
  }

  static async orderPrismaIntoOrderResponse(
    orderPrisma: Order,
    addressPrisma: Address,
    expeditionPrisma: Expedition,
    productsOrder: ProductOrder[],
  ): Promise<ResponseOrderDto> {
    const allProductsOrderDto: ProductOrderDto[] = [];
    for (const value of productsOrder) {
      allProductsOrderDto.push(
        await this.productOrderPrismaIntoProductOrderDto(value),
      );
    }
    return {
      expedition:
        await ConvertHelper.expeditionPrismaIntoExpeditionResponse(
          expeditionPrisma,
        ),
      paymentMethod: orderPrisma.paymentMethod,
      productsOrdersDto: allProductsOrderDto,
      address: await ConvertHelper.addressPrismaIntoAddressResponse(
        addressPrisma,
        null,
        null,
      ),
    };
  }
}
