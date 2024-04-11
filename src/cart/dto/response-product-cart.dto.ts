import ResponseProductDto from '../../product/dto/response-product.dto';

export default class ResponseProductCartDto {
  cartId: string;
  quantity: number;
  price: number;
  product: ResponseProductDto;
}
