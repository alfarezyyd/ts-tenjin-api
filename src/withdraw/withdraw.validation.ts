import { z, ZodType } from 'zod';

export class WithdrawValidation {
  static readonly CREATE: ZodType = z
    .object({
      totalBalance: z.number().gte(1),
    })
    .strict();
}
