import { PartialType } from '@nestjs/swagger';
import { CreateGoogleAuthenticationDto } from './create-google-authentication.dto';

export class UpdateGoogleAuthenticationDto extends PartialType(CreateGoogleAuthenticationDto) {}
