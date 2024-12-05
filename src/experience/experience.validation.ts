import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { EmploymentType } from '@prisma/client';

const createExperienceSchema = z.object({
  positionName: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200),
  employmentType: z.string().transform((arg, ctx) => {
    return ConvertHelper.convertStringIntoEnum(
      arg,
      ctx,
      'Employment type not valid',
      EmploymentType,
    );
  }),
  location: z.string().min(1).max(200),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .transform((arg) => new Date(arg).toISOString()),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .transform((arg) => new Date(arg).toISOString()),
  description: z.optional(z.string()),
});

const updateExperienceSchema = createExperienceSchema.extend({
  deletedFilesName: z.array(z.string().min(1)).optional(),
});

export default class ExperienceValidation {
  static readonly CREATE: ZodType = createExperienceSchema.superRefine(
    (arg, ctx) => {
      const start = new Date(arg.startDate);
      const end = new Date(arg.endDate);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'], // Bisa juga diubah ke "endDate" tergantung preferensi
          message: 'Start date cannot be after end date',
        });
      }
    },
  );
  static readonly UPDATE: ZodType = updateExperienceSchema;
}
