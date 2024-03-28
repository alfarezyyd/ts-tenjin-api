import { z, ZodType } from 'zod';
import { ConditionEnum } from './enum/condition.enum';
import { StatusEnum } from './enum/status.enum';
import { ConvertHelper } from '../helper/convert.helper';

export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100),
    condition: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        ConditionEnum,
      );
    }),
    description: z.string().optional(),
    price: z.number(),
    minimumOrder: z.number().min(1),
    status: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        StatusEnum,
      );
    }),
    stock: z.number().min(1),
    sku: z.string().min(1),
    weight: z.number().min(1),
    height: z.number().min(1),
    width: z.number().min(1),
  });
}
