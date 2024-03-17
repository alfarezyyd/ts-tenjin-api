import { z, ZodType } from 'zod';
import { GenderEnum } from './enum/gender.enum';

export class UserValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(255),
    gender: z.string().transform((arg, ctx) => {
      if (!Object.values(GenderEnum).includes(arg.toUpperCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'User gender not valid',
        });
        return z.NEVER;
      } else {
        return GenderEnum[arg];
      }
    }),
    email: z.string().min(1).max(255),
    telephone: z.string().min(1).max(13),
  });
}
