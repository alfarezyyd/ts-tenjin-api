import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export default class ValidationService {
  validate<T>(zodType: ZodType<T>, data: T): T {
    return zodType.parse(data);
  }
}
