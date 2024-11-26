import {
  AssistanceLanguage,
  AssistanceResource,
  AssistanceTags,
  Category,
  Mentor,
} from '@prisma/client';

export class ResponseAssistanceDto {
  id: bigint;
  mentorId: bigint;
  categoryId: number;
  topic: string;
  description: string;
  durationMinutes: number;
  price: number;
  format: string;
  capacity: number;
  isActive: boolean;
  ratingAverage: string;
  createdAt: Date;
  updatedAt: Date;
  mentor: Mentor; // Relasi dengan Mentor
  category: Category; // Relasi dengan Category
  AssistanceLanguage: AssistanceLanguage[]; // Array relasi
  AssistanceTag: AssistanceTags[]; // Array relasi
  AssistanceResource: AssistanceResource[]; // Array resource
}
