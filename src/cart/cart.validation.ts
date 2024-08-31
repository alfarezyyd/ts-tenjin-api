import { z } from 'zod';

export default class CartValidation {
  static readonly SAVE = z.object({
    assistanceId: z.number().gt(1),
  });
}
