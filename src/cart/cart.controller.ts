import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { WebResponse } from '../model/web.response';
import ResponseCart from './dto/response-cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':assistanceId')
  async create(
    @Param('assistanceId', ParseIntPipe) assistanceId: number,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.cartService.create(assistanceId),
      },
    };
  }

  @Get()
  async findAll(): Promise<WebResponse<ResponseCart[]>> {
    return {
      result: {
        data: await this.cartService.findAll(),
      },
    };
  }

  @Patch('')
  update(@Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(updateCartDto);
  }

  @Delete(':assistanceId')
  async remove(@Param('assistanceId') assistanceId: bigint) {
    return {
      result: {
        message: await this.cartService.remove(assistanceId),
      },
    };
  }
}
