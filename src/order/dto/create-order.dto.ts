export class CreateOrderDto {
  assistanceId: bigint;
  mentorId: bigint;
  sessionTimestamp: string;
  minutesDurations: number;
  note: string;
}
