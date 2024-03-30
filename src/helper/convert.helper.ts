import { ResponseUserDto } from '../user/dto/response-user.dto';
import { Address, Store, User } from '@prisma/client';
import { RefinementCtx, z } from 'zod';
import { ResponseStoreDto } from '../store/dto/response-store.dto';
import { ResponseAddressDto } from '../address/dto/response-address.dto';

export class ConvertHelper {
  static async storePrismaIntoStoreResponse(
    storePrisma: Store,
  ): Promise<ResponseStoreDto> {
    return {
      id: storePrisma.id.toString(),
      name: storePrisma.name,
      domain: storePrisma.domain,
      slogan: storePrisma.slogan,
      locationName: storePrisma.locationName,
      city: storePrisma.city,
      zipCode: storePrisma.zipCode,
      detail: storePrisma.detail,
      description: storePrisma.description,
      photoPath: storePrisma.photoPath,
    };
  }

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

  static async addressPrismaIntoAddressResponse(
    addressPrisma: Address,
  ): Promise<ResponseAddressDto> {
    return {
      id: addressPrisma.id.toString(),
      label: addressPrisma.label,
      detail: addressPrisma.detail,
      notes: addressPrisma.notes,
      receiverName: addressPrisma.receiverName,
      telephone: addressPrisma.telephone,
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
