import { z, ZodType } from 'zod';
import { GenderEnum } from './enum/gender.enum';
import ConvertHelper from '../helper/convert.helper';

export class UserValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(255),
    gender: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        GenderEnum,
      );
    }),
    email: z.string().min(1).max(255),
    telephone: z.string().min(1).max(13),
  });
}
