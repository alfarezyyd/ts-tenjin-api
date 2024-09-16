import { ResponseUserDto } from '../user/dto/response-user.dto';
import {
  Assistance,
  AssistanceLanguage,
  Language,
  Mentor,
  User,
} from '@prisma/client';
import { RefinementCtx, z } from 'zod';
import { ResponseAssistanceDto } from '../assistance/dto/response-assistance.dto';

export default class ConvertHelper {
  static async userPrismaIntoUserResponse(
    userPrisma: User,
  ): Promise<ResponseUserDto> {
    return {
      ...userPrisma,
      id: userPrisma.id.toString(),
    };
  }

  static async assistantPrismaIntoAssistantResponse(
    allAssistantsWithRelationship,
  ) {
    const allResponseAssistants: ResponseAssistanceDto[] = [];
    for (const assistantWithRelationship of allAssistantsWithRelationship) {
      const { topic, durationMinutes, price, format, isActive } =
        assistantWithRelationship;
      const responseAssistant: ResponseAssistanceDto = {
        id: assistantWithRelationship.id.toString(),
        mentorId: assistantWithRelationship.mentorId.toString(),
        categoryId: assistantWithRelationship['categoryId'].toString(),
        categoryName: assistantWithRelationship['category']['name'],
        topic,
        durationMinutes: durationMinutes.toString(),
        price: price.toString(),
        format,
        isActive,
      };
      allResponseAssistants.push(responseAssistant);
    }
    return allResponseAssistants;
  }
  static convertStringIntoEnum<T extends object>(
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
