import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { UserGender } from '@prisma/client';

export default class AuthenticationValidation {
  static readonly SIGN_UP: ZodType = z.object({
    name: z.coerce.string().min(5).max(100),
    gender: z.coerce.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'User gender not valid',
        UserGender,
      );
    }),
    email: z.coerce.string().email(),
    password: z.coerce.string().min(8).max(50),
    telephone: z.coerce.string().min(10).max(15),
  });
}
