import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { Public } from './decorator/set-metadata.decorator';
import SignUpDto from './dto/sign-up.dto';
import { WebResponse } from '../model/web.response';
import { ResponseAuthenticationDto } from './dto/response-authentication';
import { NoVerifiedEmail } from './decorator/set-no-verified-email.decorator';
import { CurrentUser } from './decorator/current-user.decorator';
import LoggedUser from './dto/logged-user.dto';

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

  @NoVerifiedEmail(true)
  @Get('generate-otp')
  async generateOneTimePasswordVerification(
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.authenticationService.generateOneTimePasswordVerification(
          currentUser,
        ),
      },
    };
  }

  @NoVerifiedEmail(true)
  @Post('verify-otp/:oneTimePassword')
  async verifyOneTimePasswordToken(
    @CurrentUser() currentUser: LoggedUser,
    @Param('oneTimePassword') oneTimePassword: string,
  ): Promise<WebResponse<boolean>> {
    console.log(oneTimePassword);
    return {
      result: {
        data: await this.authenticationService.verifyOneTimePasswordToken(
          currentUser,
          oneTimePassword,
        ),
      },
    };
  }

  @NoVerifiedEmail(true)
  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() { email }: { email: string },
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.authenticationService.getForgotPasswordToken(email),
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
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(+id);
  }
}
