import { z, ZodType } from 'zod';
import { GenderEnum } from './enum/gender.enum';
import ConvertHelper from '../helper/convert.helper';
import PrismaService from '../common/prisma.service';

export class UserValidation {
  static userValidationWrapper(prismaService: PrismaService): ZodType {
    return z.object({
      name: z.string().min(1).max(255),
      gender: z.string().transform((arg, ctx) => {
        return ConvertHelper.convertStringIntoEnum(
          arg,
          ctx,
          'Product condition not valid',
          GenderEnum,
        );
      }),
      email: z
        .string()
        .min(1)
        .max(255)
        .refine((arg) => {
          prismaService.user
            .count({
              where: {
                email: arg,
              },
            })
            .then((value) => {
              return value < 1;
            });
        }, 'Email has been registered before'),
      telephone: z.string().min(1).max(13),
      password: z.string().min(1).max(100),
    });
  }
}
