import { UserGender } from '@prisma/client';

export class CreateUserDto {
  name: string;
  gender: UserGender;
  email: string;
  password: string;
  telephone: string;
}
