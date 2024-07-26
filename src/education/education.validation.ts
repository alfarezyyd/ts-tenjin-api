import { z, ZodType } from 'zod';

export default class EducationValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().max(255).min(5),
    degree: z.string().max(255).min(5),
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
    description: z.string().max(255).min(10),
  });

  static readonly UPDATE: ZodType = z.union([
    EducationValidation.SAVE,
    z.object({
      id: z.bigint(),
    }),
  ]);
}
