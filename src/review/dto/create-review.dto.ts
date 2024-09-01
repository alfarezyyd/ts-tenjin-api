export class CreateReviewDto {
  orderId: string;
  assistantId: bigint;
  rating: number;
  review: string;
}
