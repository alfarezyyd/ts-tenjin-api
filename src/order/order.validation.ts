import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly SAVE: ZodType = z.object({
    assistanceId: z
      .union([z.string(), z.number(), z.bigint()])
      .transform((value) => BigInt(value))
      .refine((value) => value >= BigInt(1), {
        message: 'assistanceId must be greater than or equal to 1',
      }),
    mentorId: z
      .union([z.string(), z.number(), z.bigint()])
      .transform((value) => BigInt(value))
      .refine((value) => value >= BigInt(1), {
        message: 'mentorId must be greater than or equal to 1',
      }),
    sessionTimestamp: z
      .string()
      .transform((value) => new Date(value))
      .refine((date) => !isNaN(date.getTime()), {
        message: 'Invalid date format',
      }),
    minutesDurations: z.number().min(1),
    note: z.optional(z.string().min(1)),
  });
}
