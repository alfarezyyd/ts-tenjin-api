import { GenderEnum } from '../enum/gender.enum';

export class CreateUserDto {
  name: string;
  gender: GenderEnum;
  email: string;
  password: string;
  telephone: string;
}
