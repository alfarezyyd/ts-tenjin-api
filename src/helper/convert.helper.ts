import { ResponseUserDto } from '../user/dto/response-user.dto';
import { User } from '@prisma/client';
import { RefinementCtx, z } from 'zod';

export default class ConvertHelper {
  static async userPrismaIntoUserResponse(
    userPrisma: User,
  ): Promise<ResponseUserDto> {
    return {
      ...userPrisma,
      id: userPrisma.id.toString(),
    };
  }

  static convertStringIntoEnum<T>(
    arg: string,
    ctx: RefinementCtx,
    msg: string,
    classEnum: T,
  ): string {
    if (!Object.values(classEnum).includes(arg.toUpperCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg,
      });
      return z.NEVER;
    } else {
      return arg.toUpperCase().toString();
    }
  }
}
