import { z, ZodType } from 'zod';

export class LanguageValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(255),
  });
}
