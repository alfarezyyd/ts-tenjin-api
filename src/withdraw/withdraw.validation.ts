import { z, ZodType } from 'zod';

export class WithdrawValidation {
  static readonly CREATE: ZodType = z
    .object({
      totalCoin: z.number().gte(1),
      bankAccountId: z.number().gte(1),
    })
    .strict();
}
