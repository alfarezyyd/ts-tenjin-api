import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { WebResponse } from '../../model/web.response';
import { Public } from '../decorator/set-metadata.decorator';
import { NoVerifiedEmail } from '../decorator/set-no-verified-email.decorator';

@Controller('authentication/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Public()
  @NoVerifiedEmail(true)
  @Get('')
  @Redirect('', 301)
  async redirectGoogleAuthentication() {
    console.log(
      await this.googleAuthenticationService.forwardGoogleAuthentication(),
    );
    return {
      url: await this.googleAuthenticationService.forwardGoogleAuthentication(),
    };
  }
  @Public()
  @NoVerifiedEmail(true)
  @Get('callback')
  async handleGoogleAuthenticationCallback(
    @Query('code') code: string,
  ): Promise<WebResponse<string>> {
    const generatedAccessToken =
      await this.googleAuthenticationService.generateGoogleAuthenticationToken(
        code,
      );

    const googleAuthenticatedUser =
      await this.googleAuthenticationService.getAuthenticatedGoogleUserInformation(
        generatedAccessToken,
      );

    // Generate JWT Token
    const generatedJWTToken =
      await this.googleAuthenticationService.generateJwtToken({
        sub: googleAuthenticatedUser['sub'],
      });
    return {
      result: {
        data: generatedJWTToken,
      },
    };
  }
}
