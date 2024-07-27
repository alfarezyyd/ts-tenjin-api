import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly SAVE: ZodType = z.object({
    assistanceId: z.bigint().gte(BigInt(1)),
    mentorId: z.bigint().gte(BigInt(1)),
    sessionTimestamp: z.date(),
    minutesDurations: z.number().min(1),
    note: z.optional(z.string().min(1)),
  });
}
