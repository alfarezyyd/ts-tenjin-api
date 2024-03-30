import { z, ZodType } from 'zod';
import { ConvertHelper } from '../helper/convert.helper';
import { productCondition, productStatus } from '@prisma/client';

export class ProductValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(100),
    condition: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        productCondition,
      );
    }),
    description: z.string().optional(),
    price: z.number(),
    minimumOrder: z.number().min(1),
    status: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product status not valid',
        productStatus,
      );
    }),
    stock: z.number().min(1),
    sku: z.string().min(1),
    weight: z.number().min(1),
    height: z.number().min(1),
    width: z.number().min(1),
  });
}
