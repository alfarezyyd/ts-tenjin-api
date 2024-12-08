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
      confirmPassword: z.coerce
        .string()
        .min(8, {
          message: 'Confirm Password must be at least 8 characters long',
        })
        .max(50, {
          message: 'Confirm Password must be at most 50 characters long',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'], // Menentukan field yang akan mendapatkan pesan error
    });
  static readonly RESET_PASSWORD: ZodType = z
    .object({
      email: z.string().min(1).max(100),
      password: z.string().min(1).max(100),
      confirmPassword: z.string().min(1).max(100),
    })
    .superRefine((arg, ctx) => {
      if (arg.password !== arg.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'], // Bisa juga diubah ke "endDate" tergantung preferensi
          message: 'Confirm password different with password',
        });
      }
    });
}
