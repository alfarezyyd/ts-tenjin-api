import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly SAVE: ZodType = z
    .object({
      assistantId: z
        .union([z.string(), z.number(), z.bigint()])
        .transform((value) => BigInt(value))
        .refine((value) => value >= BigInt(1), {
          message: 'assistantId must be greater than or equal to 1',
        }),
      mentorId: z
        .union([z.string(), z.number(), z.bigint()])
        .transform((value) => BigInt(value))
        .refine((value) => value >= BigInt(1), {
          message: 'mentorId must be greater than or equal to 1',
        }),
      sessionStartTimestamp: z
        .string()
        .transform((value) => new Date(value)) // Mengubah string menjadi Date
        .refine((date) => !isNaN(date.getTime()), {
          message: 'Invalid date format', // Validasi jika format tanggal tidak valid
        })
        .transform((value) => value.toISOString()),
      sessionEndTimestamp: z
        .string()
        .transform((value) => new Date(value)) // Mengubah string menjadi Date
        .refine((date) => !isNaN(date.getTime()), {
          message: 'Invalid date format', // Validasi jika format tanggal tidak valid
        })
        .transform((value) => value.toISOString()),
      minutesDurations: z.number().min(1),
      sessionCount: z.number().min(1).max(100),
      note: z.optional(z.string().min(1)),
    })
    .refine(
      (data) => {
        const sessionStart = new Date(data.sessionStartTimestamp);
        const sessionEnd = new Date(data.sessionEndTimestamp);
        return sessionStart.getTime() <= sessionEnd.getTime();
      },
      {
        message: 'Passwords do not match',
        path: ['confirmPassword'], // Menentukan field yang akan mendapatkan pesan error
      },
    );
}
