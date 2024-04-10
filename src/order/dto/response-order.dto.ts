import { ProductOrderDto } from './product-order.dto';
import { ResponseAddressDto } from '../../address/dto/response-address.dto';
import { ResponseExpeditionDto } from '../../expedition/dto/response-expedition.dto';

export default class ResponseOrderDto {
  paymentMethod: string;
  address?: ResponseAddressDto;
  expedition?: ResponseExpeditionDto;
  productsOrdersDto: ProductOrderDto[];
}
