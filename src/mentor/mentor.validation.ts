import { z, ZodType } from 'zod';

export class MentorValidation {
  static readonly CREATE: ZodType = z.object({
    mentorAddresses: z.object({
      street: z.string().min(10).max(100),
      village: z.string().min(10).max(100),
      neighbourhoodNumber: z.string().max(10),
      hamletNumber: z.string().max(10),
      urbanVillage: z.string().min(10).max(100),
      subDistrict: z.string().min(10).max(100),
      district: z.string().min(10).max(100),
      province: z.string().min(10).max(100),
    }),
    mentorBankAccount: z.object({
      accountHolderName: z.string().min(10).max(200),
      bankName: z.string().min(10).max(200),
      accountNumber: z.string().min(10).max(200),
      paymentRecipientEmail: z.optional(z.string().min(10).max(200)),
    }),
    pin: z.string().length(6),
  });
}
