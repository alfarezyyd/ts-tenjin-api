import { z, ZodType } from 'zod';

export default class EducationValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().max(255).min(10),
    degree: z.string().max(255).min(10),
    studyField: z.string().max(255).min(10),
    startDate: z.string().date(),
    endDate: z.string().date(),
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
