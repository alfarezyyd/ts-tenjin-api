import { z, ZodType } from 'zod';

export default class AddressValidation {
  static readonly SAVE: ZodType = z.object({
    label: z.string().min(1).max(30),
    detail: z.string().min(1).max(200),
    notes: z.string().min(1).max(45),
    receiverName: z.string().min(1).max(50),
    telephone: z.string().min(1).max(13),
  });
}
