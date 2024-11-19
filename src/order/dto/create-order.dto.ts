export class CreateOrderDto {
  assistantId: bigint;
  mentorId: bigint;
  sessionStartTimestamp: string;
  sessionEndTimestamp: string;
  minutesDurations: number;
  note: string;
  sessionCount: number;
}
