import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from './dto/response-authentication';
import * as bcrypt from 'bcrypt';
import { Mentor, User } from '@prisma/client';
import SignUpDto from './dto/sign-up.dto';
import ValidationService from '../common/validation.service';
import AuthenticationValidation from './authentication.validation';
import PrismaService from '../common/prisma.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<ResponseAuthenticationDto> {
    const user: User & { Mentor?: Mentor | null } =
      await this.userService.findOne(signInDto.email);
    if (!(await bcrypt.compare(signInDto.password, user?.password))) {
      throw new UnauthorizedException('Username or password not valid');
    }
    const payloadJwt = {
      id: user.uniqueId,
      email: user.email,
      mentorId: user.Mentor.id.toString() ?? null,
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

  async signUp(signUpDto: SignUpDto) {
    const validatedSignUpDto = this.validationService.validate(
      AuthenticationValidation.SIGN_UP,
      signUpDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user.findFirst({
        where: {
          email: signUpDto.email,
        },
      });
      if (userPrisma) {
        throw new BadRequestException(
          `${signUpDto.email} has been registered before`,
        );
      }
      await prismaTransaction.user.create({
        data: validatedSignUpDto,
      });
      return `Success! new user has been created`;
    });
  }
}
