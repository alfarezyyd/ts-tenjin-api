import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { ProductValidation } from './product.validation';
import CommonHelper from '../helper/common.helper';
import { Product } from '@prisma/client';
import { ConvertHelper } from '../helper/convert.helper';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    storeId: bigint,
    createProductDto: CreateProductDto,
  ): Promise<string> {
    const createProductRequest = this.validationService.validate(
      ProductValidation.SAVE,
      createProductDto,
    );
    await this.prismaService.store
      .findFirstOrThrow({
        where: {
          id: storeId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 404);
      });

    await this.prismaService.product.create({
      data: {
        ...createProductRequest,
        slug: await CommonHelper.slugifyProductName(createProductRequest.name),
        storeId: storeId,
      },
    });
    return 'Success! new product has been created';
  }

  async findAllByStoreId(): Promise<string> {
    return `This action returns all product`;
  }

  async findOne(storeId: bigint, id: bigint) {
    const productPrisma: Product = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          storeId: storeId,
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 404);
      });
    return ConvertHelper.productPrismaIntoProductResponse(productPrisma);
  }

  async update(
    storeId: bigint,
    id: bigint,
    updateProductDto: UpdateProductDto,
  ): Promise<string> {
    const validateUpdateProduct: UpdateProductDto =
      this.validationService.validate(ProductValidation.SAVE, updateProductDto);
    let productPrisma: Product = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          storeId: storeId,
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 404);
      });
    productPrisma = {
      ...productPrisma,
      ...validateUpdateProduct,
      slug: await CommonHelper.slugifyProductName(validateUpdateProduct.name),
    };
    await this.prismaService.product.update({
      data: productPrisma,
      where: {
        id: id,
      },
    });
    return 'Success! product has been edited';
  }

  async remove(storeId: bigint, id: bigint) {
    const productPrisma = await this.prismaService.product.delete({
      where: {
        storeId: storeId,
        id: id,
      },
    });
    if (productPrisma == null) {
      throw new HttpException('Product not found', 404);
    }
    return `Success! product has been deleted`;
  }
}
