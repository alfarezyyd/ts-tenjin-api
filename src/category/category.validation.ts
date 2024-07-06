import { z, ZodType } from 'zod';

export class CategoryValidation {
  static readonly SAVE: ZodType = z.object({});
}
