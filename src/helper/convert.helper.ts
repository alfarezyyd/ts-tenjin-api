import { ResponseUserDto } from '../user/dto/response-user.dto';
import { User } from '@prisma/client';
import { GenderEnum } from '../user/enum/gender.enum';
import { RefinementCtx, z } from 'zod';

export class ConvertHelper {
  static async;

  static async userPrismaIntoUserResponse(
    userPrisma: User,
  ): Promise<ResponseUserDto> {
    return {
      id: userPrisma.id,
      name: userPrisma.name,
      gender: GenderEnum[userPrisma.gender],
      email: userPrisma.email,
      telephone: userPrisma.telephone,
      pin: userPrisma.pin,
      photoPath: userPrisma.photoPath,
    };
  }

  static async convertStringIntoEnum<T>(
    arg: string,
    ctx: RefinementCtx,
    msg: string,
    classEnum: T,
  ): Promise<any> {
    if (!Object.values(classEnum).includes(arg.toUpperCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg,
      });
      return z.NEVER;
    } else {
      return classEnum[arg];
    }
  }
}
