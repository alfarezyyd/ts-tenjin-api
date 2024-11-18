import { ResponseUserDto } from '../user/dto/response-user.dto';
import { AssistanceFormat, User } from '@prisma/client';
import { RefinementCtx, z } from 'zod';
import { ResponseAssistanceDto } from '../assistance/dto/response-assistance.dto';
import { Decimal } from '@prisma/client/runtime/library';

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
    allAssistantsWithRelationship: ({
      AssistanceLanguage: { assistantId: bigint; languageId: number }[];
      category: { id: number; logo: string; name: string };
      mentor: { id: bigint; userId: bigint };
      AssistanceTag: { tagId: number }[];
      AssistanceResource: { imagePath: string }[];
    } & {
      capacity: number;
      categoryId: number;
      createdAt: Date;
      description: string;
      durationMinutes: number;
      format: AssistanceFormat;
      id: bigint;
      isActive: boolean;
      mentorId: bigint;
      price: number;
      ratingAverage: Decimal;
      topic: string;
      updatedAt: Date;
    })[],
  ) {
    const allResponseAssistants: ResponseAssistanceDto[] = [];
    for (const assistantWithRelationship of allAssistantsWithRelationship) {
      const { topic, durationMinutes, price, format, isActive } =
        assistantWithRelationship;
      const responseAssistant: ResponseAssistanceDto = {
        id: assistantWithRelationship.id.toString(),
        mentorId: assistantWithRelationship.mentorId.toString(),
        mentorName: assistantWithRelationship['mentor']['user']['name'],
        gender: assistantWithRelationship['mentor']['user']['gender'],
        categoryId: assistantWithRelationship['categoryId'].toString(),
        categoryName: assistantWithRelationship['category']['name'],
        capacity: assistantWithRelationship['capacity'],
        description: assistantWithRelationship['description'],
        tagId: assistantWithRelationship['AssistanceTag'].map(
          (tag) => tag.tagId,
        ),
        imagePath: assistantWithRelationship['AssistanceResource'].map(
          (resource) => resource.imagePath,
        ),
        topic,
        durationMinutes: durationMinutes.toString(),
        price: price.toString(),
        format,
        isActive,
        languageId:
          assistantWithRelationship['AssistanceLanguage'][0]['languageId'],
        uniqueId: assistantWithRelationship['mentor']['user']['uniqueId'],
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
