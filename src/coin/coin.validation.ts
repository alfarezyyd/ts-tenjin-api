import { z } from 'zod';

export class CoinValidation {
  static readonly CREATE = z
    .object({
      coinAmount: z.number().min(1).max(100_000_000),
      totalPrice: z.number().min(1),
    })
    .strict();
}
