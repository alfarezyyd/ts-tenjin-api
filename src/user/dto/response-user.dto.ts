import { GenderEnum } from '../enum/gender.enum';

export class ResponseUserDto {
  id: bigint;
  name: string;
  gender: GenderEnum;
  email: string;
  telephone: string;
  pin: string;
  photoPath: string;
}
