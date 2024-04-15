import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { WebResponse } from '../model/web.response';
import ResponseProductDto from './dto/response-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/stores/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':storeId')
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10_000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    productImage: Array<Express.Multer.File>,
  ): Promise<WebResponse<string>> {
    createProductDto.productImages = productImage;
    return {
      result: {
        message: await this.productService.create(storeId, createProductDto),
      },
    };
  }

  @Get(':storeId/:productId')
  async findOne(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('productId', ParseIntPipe) productId: bigint,
  ): Promise<WebResponse<ResponseProductDto>> {
    return {
      result: {
        data: await this.productService.findOne(storeId, productId),
      },
    };
  }

  @Put(':storeId/:productId')
  async update(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('productId', ParseIntPipe) productId: bigint,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.productService.update(
          storeId,
          productId,
          updateProductDto,
        ),
      },
    };
  }

  @Delete(':storeId/:productId')
  async remove(
    @Param('storeId', ParseIntPipe) storeId: bigint,
    @Param('productId', ParseIntPipe) productId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.productService.remove(storeId, productId),
      },
    };
  }
}
