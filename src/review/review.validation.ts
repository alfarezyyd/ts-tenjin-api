import { z } from 'zod';

export default class ReviewValidation {
  static readonly SAVE = z.object({
    orderId: z.coerce.string(),
    assistantId: z.coerce.bigint().gte(BigInt(1)),
    rating: z.coerce.number().gte(0),
    review: z.coerce.string(),
    removedResourcePaths: z.array(z.string()),
  });

  static readonly DELETE = z.object({
    orderId: z.coerce.string(),
    assistantId: z.coerce.bigint().gte(BigInt(1)),
  });
}