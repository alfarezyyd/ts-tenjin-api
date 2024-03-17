import { ResponseUserDto } from '../user/dto/response-user.dto';
import { User } from '@prisma/client';
import { GenderEnum } from '../user/enum/gender.enum';

export class ConvertHelper {
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
      photoPath: userPrisma.photo_path,
    };
  }
}
