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
import { WebResponse } from '../model/web.response';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  async findAllProductByCartId(
    @Param('cartId', ParseIntPipe) cartId: bigint,
  ): Promise<WebResponse<ResponseProductCartDto[]>> {
    return {
      result: {
        data: await this.cartService.findAllProductByCartId(cartId),
      },
    };
  }

  @Post(':cartId')
  async appendProductIntoCart(
    @Param('cartId', ParseIntPipe) cartId: bigint,
    @Body() createProductCartDto: CreateProductCartDto,
  ): Promise<WebResponse<string>> {
    createProductCartDto.cartId = cartId;
    return {
      result: {
        message:
          await this.cartService.attachProductIntoCart(createProductCartDto),
      },
    };
  }

  @Delete(':cartId/:productId')
  async detachProductFromCart(
    @Param('cartId') cartId: bigint,
    @Param('productId') productId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.cartService.detachProductFromCart(
          cartId,
          productId,
        ),
      },
    };
  }
}
