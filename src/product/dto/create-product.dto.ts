import { productCondition, productStatus } from '@prisma/client';

export class CreateProductDto {
  name: string;
  condition: productCondition;
  description?: string;
  price: number;
  minimumOrder: number;
  status: productStatus;
  stock: number;
  sku: string;
  weight: number;
  height: number;
  width: number;
  productImages?: Array<Express.Multer.File>;
}
