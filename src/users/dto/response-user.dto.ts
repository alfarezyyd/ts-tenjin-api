export class ResponseUserDto {
  id: string;
  name: string;
  gender: string;
  email: string;
  telephone: string;
  pin?: string | null;
  photoPath?: string | null;
}
