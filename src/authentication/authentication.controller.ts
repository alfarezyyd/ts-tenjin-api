import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { Public } from './decorator/set-metadata.decorator';
import SignUpDto from './dto/sign-up.dto';
import { WebResponse } from '../model/web.response';
import { ResponseAuthenticationDto } from './dto/response-authentication';
import { NoVerifiedEmail } from './decorator/set-no-verified-email.decorator';

@Controller('authentication/self')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @NoVerifiedEmail(true)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.authenticationService.signIn(signInDto),
      },
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.authenticationService.signUp(signUpDto),
      },
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Post('generate-otp')
  async generateOneTimePasswordVerification(
    @Body() generateOtpDto: { email: string },
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.authenticationService.generateOneTimePasswordVerification(
          generateOtpDto,
        ),
      },
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Post('verify-otp/:oneTimePassword')
  async verifyOneTimePasswordToken(
    @Body() verifyOtpDto: { email: string },
    @Param('oneTimePassword') oneTimePassword: string,
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.authenticationService.verifyOneTimePasswordToken(
          verifyOtpDto.email,
          oneTimePassword,
        ),
      },
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Post('reset-password')
  async resetPassword(
    @Body()
    resetPasswordDto: {
      email: string;
      password: string;
      confirmPassword: string;
    },
  ): Promise<WebResponse<boolean>> {
    return {
      result: {
        data: await this.authenticationService.handleResetPassword(
          resetPasswordDto,
        ),
      },
    };
  }

  @Get()
  findAll() {
    return this.authenticationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authenticationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuthenticationDto: UpdateAuthenticationDto,
  ) {
    return this.authenticationService.update(+id, updateAuthenticationDto);
  }

  @Delete(':id')
  async signOut(@Param('id') id: string) {
    return this.authenticationService.remove(+id);
  }
}
