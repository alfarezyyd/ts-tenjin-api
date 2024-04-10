import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
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
    price: z.coerce.number(),
    minimumOrder: z.coerce.number().min(1),
    status: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product status not valid',
        productStatus,
      );
    }),
    stock: z.coerce.number().min(1),
    sku: z.string().min(1),
    weight: z.coerce.number().min(1),
    height: z.coerce.number().min(1),
    width: z.coerce.number().min(1),
  });
}
