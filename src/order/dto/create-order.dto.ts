export class CreateOrderDto {
  assistantId: bigint;
  mentorId: bigint;
  sessionTimestamp: string;
  minutesDurations: number;
  note: string;
  sessionCount: number;
}
