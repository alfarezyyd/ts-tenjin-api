import { PartialType } from '@nestjs/swagger';
import { CreateProductCartDto } from './create-product-cart.dto';

export class UpdateCartDto extends PartialType(CreateProductCartDto) {}
