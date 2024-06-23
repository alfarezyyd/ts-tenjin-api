import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { EmploymentTypeEnum } from './enum/employment-type.enum';

export default class ExperienceValidation {
  static readonly CREATE: ZodType = z.object({
    positionName: z.string().min(1).max(200),
    companyName: z.string().min(1).max(200),
    employmentType: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Employment type not valid',
        EmploymentTypeEnum,
      );
    }),
    location: z.string().min(1).max(200),
    startDate: z.string().date(),
    endDate: z.string().date(),
    description: z.optional(z.string()),
  });

  static readonly UPDATE: ZodType = z.union([
    ExperienceValidation.CREATE,
    z.object({
      experienceId: z.bigint(),
    }),
  ]);
}
