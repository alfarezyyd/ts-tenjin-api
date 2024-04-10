import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateProductCartDto } from './dto/create-product-cart.dto';
import ResponseProductCartDto from './dto/response-product-cart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  async findAllProductByCartId(
    @Param('cartId', ParseIntPipe) cartId: bigint,
  ): Promise<ResponseProductCartDto[]> {
    return this.cartService.findAllProductByCartId(cartId);
  }

  @Post(':cartId')
  appendProductIntoCart(
    @Param('cartId', ParseIntPipe) id: bigint,
    @Body() createProductCartDto: CreateProductCartDto,
  ) {
    createProductCartDto.cartId = id;
    return this.cartService.appendProductIntoCart(createProductCartDto);
  }

  @Delete(':cartId/:productId')
  detachProductFromCart(
    @Param('cartId') cartId: bigint,
    @Param('productId') productId: bigint,
  ) {
    return this.cartService.detachProductFromCart(cartId, productId);
  }
}
