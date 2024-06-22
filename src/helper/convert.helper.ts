import { ResponseUserDto } from '../users/dto/response-user.dto';
import { User } from '@prisma/client';
import { RefinementCtx, z } from 'zod';

export default class ConvertHelper {
  static async userPrismaIntoUserResponse(
    userPrisma: User,
  ): Promise<ResponseUserDto> {
    return {
      id: userPrisma.id.toString(),
      name: userPrisma.name,
      gender: userPrisma.gender,
      email: userPrisma.email,
      telephone: userPrisma.telephone,
      pin: userPrisma.pin,
      photoPath: userPrisma.photoPath,
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
      return arg.toUpperCase();
    }
  }
}
