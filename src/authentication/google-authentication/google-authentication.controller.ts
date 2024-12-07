import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  Response,
} from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { Public } from '../decorator/set-metadata.decorator';
import { NoVerifiedEmail } from '../decorator/set-no-verified-email.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('authentication/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @NoVerifiedEmail(true)
  @Get('')
  @Redirect('', 301)
  async redirectGoogleAuthentication() {
    return {
      url: await this.googleAuthenticationService.forwardGoogleAuthentication(),
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Get('callback')
  @Redirect('', 302)
  async handleGoogleAuthenticationCallback(@Query('code') code: string) {
    const generatedAccessToken =
      await this.googleAuthenticationService.generateGoogleAuthenticationToken(
        code,
      );

    const jwtPayload =
      await this.googleAuthenticationService.getAuthenticatedGoogleUserInformation(
        generatedAccessToken,
      );
    // Generate JWT Token
    const generatedJWTToken =
      await this.googleAuthenticationService.generateJwtToken(jwtPayload);
    return {
      url: `${this.configService.get<string>('CLIENT_BASE_URL')}/auth/login?token=${generatedJWTToken}`,
    };
  }
}
