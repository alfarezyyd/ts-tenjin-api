import { z, ZodType } from 'zod';

export class ExpeditionValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(100),
  });
}
