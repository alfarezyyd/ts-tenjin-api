import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { ProductValidation } from './product.validation';
import CommonHelper from '../helper/common.helper';
import { Product } from '@prisma/client';
import ConvertHelper from '../helper/convert.helper';
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
    const validatedCreateProductRequest = this.validationService.validate(
      ProductValidation.SAVE,
      createProductDto,
    );
    await this.prismaService.store
      .findFirstOrThrow({
        where: {
          id: storeId,
        },
      })
      .catch(() => {
        throw new HttpException(`Store with storeId ${storeId} not found`, 404);
      });

    const productPrisma = await this.prismaService.product.create({
      data: {
        ...validatedCreateProductRequest,
        slug: await CommonHelper.slugifyProductName(
          validatedCreateProductRequest.name,
        ),
        storeId: storeId,
      },
    });

    const folderPath = `${this.configService.get<string>('MULTER_DEST')}/${storeId}/${productPrisma.id}/`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdir(folderPath, (fileSystemError) => {
        if (fileSystemError) {
          throw new HttpException(
            'Error when trying to upload, try again later!',
            500,
          );
        }
      });
    }
    const allProductResource: { productId: any; imagePath: string }[] = [];
    for (const productImage of createProductDto.productImages) {
      const generatedRandomFileName: string =
        CommonHelper.generateFileName(productImage);
      const productResource: { productId: any; imagePath: string } = {
        productId: productPrisma.id,
        imagePath: generatedRandomFileName,
      };
      allProductResource.push(productResource);
      fs.writeFile(
        folderPath + generatedRandomFileName,
        productImage.buffer,
        (err) => {
          if (err) {
            throw new HttpException(err, 500);
          }
        },
      );
    }
    await this.prismaService.productResource.createMany({
      data: allProductResource,
    });
    return 'Success! new product has been created';
  }

  async findAllByStoreId(): Promise<string> {
    return `This action returns all product`;
  }

  async findOne(storeId: bigint, productId: bigint) {
    const productPrisma: Product = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          storeId: storeId,
          id: productId,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Product with productId ${productId} and storeId ${storeId} not found`,
          404,
        );
      });
    return ConvertHelper.productPrismaIntoProductResponse(productPrisma);
  }

  async update(
    storeId: bigint,
    productId: bigint,
    updateProductDto: UpdateProductDto,
  ): Promise<string> {
    const validateUpdateProduct: UpdateProductDto =
      this.validationService.validate(ProductValidation.SAVE, updateProductDto);
    let productPrisma: Product = await this.prismaService.product
      .findFirstOrThrow({
        where: {
          storeId: storeId,
          id: productId,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Product with productId ${productId} and storeId ${storeId} not found`,
          404,
        );
      });
    productPrisma = {
      ...productPrisma,
      ...validateUpdateProduct,
      slug: await CommonHelper.slugifyProductName(validateUpdateProduct.name),
    };
    const productResources: { productId: any; imagePath: string }[] = [];
    if (updateProductDto.productImages != null) {
      const folderPath = `${this.configService.get<string>('MULTER_DEST')}/${storeId}/${productPrisma.id}/`;
      await CommonHelper.deleteFolderRecursive(folderPath);
      fs.mkdir(folderPath, (err) => {
        if (err) {
          throw new HttpException(err.message, 500);
        }
      });
      for (const productImage of updateProductDto.productImages) {
        const generatedRandomFileName: string =
          CommonHelper.generateFileName(productImage);
        const productResource: { productId: any; imagePath: string } = {
          productId: productPrisma.id,
          imagePath: generatedRandomFileName,
        };
        productResources.push(productResource);
        fs.writeFile(
          folderPath + generatedRandomFileName,
          productImage.buffer,
          (err) => {
            if (err) {
              throw new HttpException(err, 500);
            }
          },
        );
      }
      await this.prismaService.$transaction([
        this.prismaService.productResource.deleteMany({
          where: {
            productId: productId,
          },
        }),
        this.prismaService.productResource.createMany({
          data: productResources,
        }),
      ]);
    }

    await this.prismaService.product.update({
      data: productPrisma,
      where: {
        id: productId,
      },
    });

    return 'Success! product has been edited';
  }

  async remove(storeId: bigint, productId: bigint) {
    const [, productPrisma] = await this.prismaService.$transaction([
      this.prismaService.productResource.deleteMany({
        where: {
          productId: productId,
        },
      }),
      this.prismaService.product.delete({
        where: {
          storeId: storeId,
          id: productId,
        },
      }),
    ]);
    await CommonHelper.deleteFolderRecursive(
      `${this.configService.get<string>('MULTER_DEST')}/${productPrisma.storeId}/${productPrisma.id}/`,
    );
    return `Success! product has been deleted`;
  }
}
