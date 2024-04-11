import ProductOrderDto from './product-order.dto';

export default class CreateOrderDto {
  paymentMethod: string;
  addressId: bigint;
  expeditionId: number;
  userId: bigint;
  productsOrdersDto: ProductOrderDto[];
}
