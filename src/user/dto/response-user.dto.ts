export class ResponseUserDto {
  id: string;
  name: string;
  gender: string;
  email: string;
  telephone: string;
  totalBalance: bigint;
  pin?: string | null;
  photoPath?: string | null;
}
