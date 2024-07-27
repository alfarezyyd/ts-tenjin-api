import { AssistanceFormat } from '@prisma/client';

export class CreateAssistanceDto {
  categoryId: number;
  topic: string;
  description: string;
  durationMinutes: number;
  price: number;
  format: AssistanceFormat;
  capacity: number;
  language: string;
  tagId: number[];
}
