import { z, ZodType } from 'zod';

export default class SkillValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(255),
    description: z.optional(z.string().min(1)),
  });

  static readonly UPDATE: ZodType = z.union([
    SkillValidation.SAVE,
    z.object({
      id: z.bigint(),
    }),
  ]);
}
