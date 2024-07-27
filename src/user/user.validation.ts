import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { UserGender } from '@prisma/client';

export class UserValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(255),
    gender: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        UserGender,
      );
    }),
    email: z.string().min(1).max(255),
    telephone: z.string().min(1).max(13),
    password: z.string().min(1).max(100),
  });
}
