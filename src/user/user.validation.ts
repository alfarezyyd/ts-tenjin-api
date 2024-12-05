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
    email: z.string().email().min(1).max(255),
    telephone: z.string().min(1).max(13),
    password: z.string().min(1).max(100),
  });

  static readonly SETTING_GENERAL_DATA = z.object({
    email: z.string().email().min(1).max(255),
    name: z.string().min(1).max(255),
    gender: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Product condition not valid',
        UserGender,
      );
    }),
    telephone: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .transform((arg, ctx) => {
        if (arg == 'null') {
          return null;
        }
        return arg;
      }),
  });

  static readonly SETTING_CHANGE_PASSWORD = z
    .object({
      oldPassword: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(50, { message: 'Password must be at most 50 characters long' }),
      newPassword: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(50, { message: 'Password must be at most 50 characters long' }),
      confirmPassword: z
        .string()
        .min(8, {
          message: 'Confirm Password must be at least 8 characters long',
        })
        .max(50, {
          message: 'Confirm Password must be at most 50 characters long',
        }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'], // Menentukan field yang akan mendapatkan pesan error
    });
}
