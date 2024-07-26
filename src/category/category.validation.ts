import { z, ZodType } from 'zod';
import PrismaService from '../common/prisma.service';

export class CategoryValidation {
  static readonly SAVE: ZodType = z.object({
    name: z.string().min(1).max(255),
  });
}
