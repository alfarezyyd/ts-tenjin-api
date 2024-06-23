import { PartialType } from '@nestjs/swagger';
import { SignInDto } from './sign-in.dto';

export class UpdateAuthenticationDto extends PartialType(SignInDto) {}
