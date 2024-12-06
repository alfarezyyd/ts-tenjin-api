import { z } from 'zod';

export default class ReviewValidation {
  static readonly SAVE = z.object({
    orderId: z.coerce.string(),
    assistantId: z.coerce.number().gte(1),
    rating: z.coerce.number().gte(0),
    review: z.coerce.string().optional(),
  });

  static readonly DELETE = z.object({
    orderId: z.coerce.string(),
    assistantId: z.coerce.number().gte(1),
  });
}
