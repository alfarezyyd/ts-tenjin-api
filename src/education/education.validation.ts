import { z, ZodType } from 'zod';

export default class EducationValidation {
  static readonly SAVE: ZodType = z
    .object({
      name: z.string().max(255).min(5),
      degree: z.string().max(255).min(3),
      studyField: z.string().max(255).min(5),
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid Date Format',
        })
        .transform((val) => new Date(val)),
      endDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid Date Format',
        })
        .transform((val) => new Date(val)),
      activity: z.string(),
      society: z.string(),
      description: z.string(),
    })
    .superRefine((arg, ctx) => {
      const start = new Date(arg.startDate);
      const end = new Date(arg.endDate);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'], // Bisa juga diubah ke "endDate" tergantung preferensi
          message: 'Start date cannot be after end date',
        });
      }
    });

  static readonly UPDATE: ZodType = z.union([
    EducationValidation.SAVE,
    z.object({
      id: z.bigint(),
    }),
  ]);
}
