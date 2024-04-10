import { ProductOrderDto } from './product-order.dto';

export default class CreateOrderDto {
  paymentMethod: string;
  addressId: bigint;
  expeditionId: bigint;
  productsOrdersDto: ProductOrderDto[];
}
