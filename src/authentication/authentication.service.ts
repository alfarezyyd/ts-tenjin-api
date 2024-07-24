import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from './dto/response-authentication';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<ResponseAuthenticationDto> {
    const user = await this.userService.findOne(signInDto.email);
    if (!(await bcrypt.compare(signInDto.password, user?.password))) {
      throw new UnauthorizedException('Username or password not valid');
    }
    const payloadJwt = {
      email: user.email,
    };
    return {
      accessToken: await this.jwtService.signAsync(payloadJwt),
    };
  }

  findAll() {
    return `This action returns all authentication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  update(id: number, updateAuthenticationDto: UpdateAuthenticationDto) {
    return `This action updates a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }
}
