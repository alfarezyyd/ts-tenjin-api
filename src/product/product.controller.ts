import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { WebResponse } from '../model/web.response';
import { ResponseProductDto } from './dto/response-product.dto';

@Controller('api/stores/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':storeId')
  async create(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Body() createProductDto: CreateProductDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.productService.create(storeId, createProductDto),
    };
  }

  @Get(':storeId/:id')
  async findOne(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('id', ParseIntPipe) id: bigint,
  ): Promise<WebResponse<ResponseProductDto>> {
    return {
      data: await this.productService.findOne(storeId, id),
    };
  }

  @Put(':storeId/:id')
  async update(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('id', ParseIntPipe) id: bigint,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.productService.update(storeId, id, updateProductDto),
    };
  }

  @Delete(':storeId/:id')
  async remove(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('id', ParseIntPipe) id: bigint,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.productService.remove(storeId, id),
    };
  }
}
