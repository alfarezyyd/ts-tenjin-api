export class CreateAssistanceDto {
  categoryId: number;
  topic: string;
  description: string;
  durationMinutes: number;
  price: number;
  format: string;
  capacity: number;
  languages: number[];
  tagId: number[];
}
