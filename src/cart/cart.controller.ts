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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
