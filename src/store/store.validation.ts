import { z, ZodType } from 'zod';

export class StoreValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(60),
    domain: z.string().min(1).max(24),
    slogan: z.string().min(1).max(48),
    locationName: z.string().min(1).max(25),
    city: z.string().min(1).max(50),
    zipCode: z.string().length(5),
    detail: z.string().min(1).max(200),
    description: z.string().min(1).max(140),
  });
}
