import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    label: z.string().min(1).max(30),
    detail: z.string().min(1).max(200),
    notes: z.string().min(1).max(45),
    receiver_name: z.string().min(1).max(50),
    telephone: z.string().min(1).max(13),
  });

  static readonly UPDATE: ZodType = z.object({
    label: z.string().min(1).max(30),
    detail: z.string().min(1).max(200),
    notes: z.string().min(1).max(45),
    receiver_name: z.string().min(1).max(50),
    telephone: z.string().min(1).max(13),
  });
}
