import { AssistanceFormat } from '../enum/assistance-format.enum';

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
