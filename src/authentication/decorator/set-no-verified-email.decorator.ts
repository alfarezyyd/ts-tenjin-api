import { SetMetadata } from '@nestjs/common';

export const NO_VERIFIED_EMAIL = 'noVerifiedEmail';
export const NoVerifiedEmail = (isVerifiedEmail: boolean) =>
  SetMetadata(NO_VERIFIED_EMAIL, isVerifiedEmail);
