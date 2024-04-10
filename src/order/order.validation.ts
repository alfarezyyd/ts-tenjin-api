import { number, string, z, ZodType } from 'zod';
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
    userId: z.number(),
    productsOrdersDto: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number(),
        subTotalPrice: z.optional(number()).transform((arg) => {
          if (arg == undefined) {
            return null;
          }
        }),
        note: z.optional(string().min(1)),
      }),
    ),
  });
}
