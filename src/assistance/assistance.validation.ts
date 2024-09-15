import { z, ZodType } from 'zod';
import ConvertHelper from '../helper/convert.helper';
import { AssistanceFormat } from '@prisma/client';

export class AssistanceValidation {
  static readonly SAVE: ZodType = z.object({
    categoryId: z.coerce.number().gte(1),
    topic: z.string().min(5).max(200),
    description: z.optional(z.string()),
    durationMinutes: z.coerce.number().min(1).max(60),
    price: z.coerce.number().min(1).max(5000000),
    format: z.string().transform((arg, ctx) => {
      return ConvertHelper.convertStringIntoEnum(
        arg,
        ctx,
        'Assistance format not valid',
        AssistanceFormat,
      );
    }),
    capacity: z.coerce.number().min(1).max(100),
    language: z.string(),
    tagId: z.array(z.coerce.number()).transform((arr) => new Set(arr)),
  });
}
