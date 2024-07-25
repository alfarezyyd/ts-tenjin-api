import { z, ZodType } from 'zod';

export class TagValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(5).max(100),
    categoryId: z.number().gte(1),
  });
}
