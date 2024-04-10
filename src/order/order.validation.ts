import { string, z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { OrderPaymentMethod } from './enum/OrderPaymentMethod';

export class OrderValidation {
  static readonly SAVE: ZodType = z.object({
    paymentMethod: z
      .string()
      .min(1)
      .max(50)
      .transform((arg, ctx) => {
        return ConvertHelper.convertStringIntoEnum(
          arg,
          ctx,
          'Payment method not valid',
          OrderPaymentMethod,
        );
      }),
    addressId: z.number(),
    expeditionId: z.number(),
    productsOrdersDto: z.object({
      productId: z.number(),
      quantity: z.number(),
      note: z.optional(string().min(1)),
    }),
  });
}
