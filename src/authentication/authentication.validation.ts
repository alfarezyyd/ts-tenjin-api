// authentication-validation.ts

import { z, ZodType } from 'zod';

export default class AuthenticationValidation {
  static readonly SIGN_UP: ZodType = z
    .object({
      name: z.coerce
        .string()
        .min(5, { message: 'Name must be at least 5 characters long' })
        .max(100, { message: 'Name must be at most 100 characters long' }),
      email: z.coerce.string().email({ message: 'Invalid email address' }),
      password: z.coerce
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(50, { message: 'Password must be at most 50 characters long' }),
      confirm_password: z.coerce
        .string()
        .min(8, {
          message: 'Confirm Password must be at least 8 characters long',
        })
        .max(50, {
          message: 'Confirm Password must be at most 50 characters long',
        }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Passwords do not match',
      path: ['confirm_password'], // Menentukan field yang akan mendapatkan pesan error
    });
  static readonly FORGOT_PASSWORD: ZodType = z.string().email();
}
