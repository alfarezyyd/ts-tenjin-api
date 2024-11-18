import { Assistance, MentorResource, User } from '@prisma/client';

export class ResponseMentorDto {
  user: User;
  mentorResources: MentorResource[];
  Assistance: Assistance[];
}
