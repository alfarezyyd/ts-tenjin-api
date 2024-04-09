import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { ProductValidation } from './product.validation';
import CommonHelper from '../helper/common.helper';
import { Product } from '@prisma/client';
import { ConvertHelper } from '../helper/convert.helper';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
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

    const productPrisma = await this.prismaService.product.create({
      data: {
        ...createProductRequest,
        slug: await CommonHelper.slugifyProductName(createProductRequest.name),
        storeId: storeId,
      },
    });

    const folderPath = `${this.configService.get<string>('MULTER_DEST')}/${storeId}/${createProductDto.sku}/`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdir(folderPath, (err) => {
        if (err) {
          throw new HttpException(err.message, 500);
        }
      });
    }
    const productResources: { productId: any; imagePath: string }[] = [];
    for (const value of createProductDto.images) {
      const generatedRandomFileName: string =
        CommonHelper.generateFileName(value);
      const productResource: { productId: any; imagePath: string } = {
        productId: productPrisma.id,
        imagePath: generatedRandomFileName,
      };
      productResources.push(productResource);
      fs.writeFile(
        folderPath + generatedRandomFileName,
        value.buffer,
        (err) => {
          if (err) {
            throw new HttpException(err, 500);
          }
        },
      );
    }
    await this.prismaService.productResource.createMany({
      data: productResources,
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
    await this.prismaService.productResource.deleteMany();
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
