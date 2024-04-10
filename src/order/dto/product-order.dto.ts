export class ProductOrderDto {
  productId: bigint;
  orderId: bigint;
  quantity: number;
  note: string;
  subTotalPrice: number;
}
