import { SetMetadata } from '@nestjs/common';

export const NO_VERIFIED_EMAIL = 'noVerifiedEmail';
export const NoVerifiedEmail = () => SetMetadata(NO_VERIFIED_EMAIL, true);
