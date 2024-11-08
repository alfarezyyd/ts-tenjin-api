import { z } from 'zod';

export class CoinValidation {
  static readonly CREATE = z
    .object({
      coinAmount: z.coerce.number().min(1).max(100),
      totalPrice: z.coerce.number().min(1),
    })
    .strict();
}
