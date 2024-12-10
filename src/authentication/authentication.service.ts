import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthenticationDto } from './dto/response-authentication';
import * as bcrypt from 'bcrypt';
import { Mentor, OneTimePasswordToken, User } from '@prisma/client';
import SignUpDto from './dto/sign-up.dto';
import ValidationService from '../common/validation.service';
import AuthenticationValidation from './authentication.validation';
import PrismaService from '../common/prisma.service';
import CommonHelper from '../helper/common.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<ResponseAuthenticationDto> {
    const user: User & { Mentor?: Mentor | null } =
      await this.userService.findOne(signInDto.email);
    if (!(await bcrypt.compare(signInDto.password, user?.password))) {
      throw new UnauthorizedException('Username or password not valid');
    }
    const payloadJwt = {
      uniqueId: user.uniqueId,
      name: user.name,
      email: user.email,
      gender: user.gender,
      telephone: user.telephone,
      mentorId: user.Mentor?.id?.toString() ?? null,
      isExternal: user.isExternal,
      isManagement: user.isManagement,
      photoPath: user.photoPath,
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
      delete validatedSignUpDto['confirmPassword'];
      const uniqueId = uuidv4();
      await prismaTransaction.user.create({
        data: {
          ...validatedSignUpDto,
          uniqueId: uniqueId,
          password: await bcrypt.hash(validatedSignUpDto.password, 10),
        },
      });
      const payloadJwt = {
        uniqueId: uniqueId,
        name: validatedSignUpDto.name,
        email: validatedSignUpDto.email,
        gender: validatedSignUpDto.gender,
        telephone: validatedSignUpDto.telephone,
        mentorId: validatedSignUpDto.Mentor?.id?.toString() ?? null,
        isExternal: false,
        isManagement: false,
        photoPath: null,
      };
      return {
        accessToken: await this.jwtService.signAsync(payloadJwt),
      };
    });
  }

  async generateOneTimePasswordVerification(generateOtpDto: {
    email: string;
  }): Promise<string> {
    const generatedOneTimePassword = await this.prismaService.$transaction(
      async (prismaTransaction) => {
        const generatedOneTimePassword =
          await CommonHelper.generateOneTimePassword();
        const hashedGeneratedOneTimePassword = await bcrypt.hash(
          generatedOneTimePassword,
          10,
        );
        const userPrisma: User = await prismaTransaction.user
          .findFirstOrThrow({
            where: {
              email: generateOtpDto.email,
            },
          })
          .catch(() => {
            throw new UnauthorizedException(`User not found`);
          });
        await prismaTransaction.oneTimePasswordToken.create({
          data: {
            userId: userPrisma['id'],
            hashedToken: hashedGeneratedOneTimePassword,
            expiresAt: new Date(new Date().getTime() + 10 * 60 * 1000),
          },
        });
        return generatedOneTimePassword;
      },
    );
    await this.mailerService.sendMail({
      from: this.configService.get<string>('EMAIL_USERNAME'),
      to: generateOtpDto.email,
      subject: 'One Time Password Verification',
      html: `
    <h1>Verifikasi OTP</h1>
    <p>Bang! ini kode OTP nya:</p>
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="padding: 8px; background-color: #f4f4f4;">Kode OTP</th>
          <th style="padding: 8px; background-color: #f4f4f4;">Berlaku Hingga</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; text-align: center;">${generatedOneTimePassword}</td>
          <td style="padding: 8px; text-align: center;">${new Date(new Date().getTime() + 10 * 60 * 1000)}</td>
        </tr>
      </tbody>
    </table>
    <p>Harap jangan membagikan kode ini kepada siapa pun.</p>
  `,
    });

    return `Successfully send one time password`;
  }

  async verifyOneTimePasswordToken(
    email: string,
    oneTimePassword: string,
  ): Promise<boolean> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            email: email,
          },
        })
        .catch(() => {
          throw new UnauthorizedException(`User not found`);
        });
      const validOneTimePasswordToken: OneTimePasswordToken =
        await prismaTransaction.oneTimePasswordToken
          .findFirstOrThrow({
            where: {
              userId: userPrisma.id,
              expiresAt: {
                gte: new Date(), // pastikan expiresAt lebih besar atau sama dengan waktu saat ini
              },
            },
            orderBy: {
              expiresAt: 'desc', // Urutkan berdasarkan expiresAt secara descending
            },
          })
          .catch(() => {
            throw new NotFoundException(
              'Token not found, please request OTP again',
            );
          });
      if (
        validOneTimePasswordToken &&
        (await bcrypt.compare(
          oneTimePassword,
          validOneTimePasswordToken.hashedToken,
        ))
      ) {
        await prismaTransaction.user.update({
          where: {
            id: userPrisma.id,
          },
          data: {
            emailVerifiedAt: new Date(),
          },
        });
        return true;
      } else {
        return false;
      }
    });
  }

  async handleResetPassword(resetPasswordDto: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const validationResetPassword = this.validationService.validate(
      AuthenticationValidation.RESET_PASSWORD,
      resetPasswordDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            email: validationResetPassword.email,
          },
        })
        .catch(() => {
          throw new NotFoundException('User not found');
        });
      delete validationResetPassword.confirmPassword;
      await prismaTransaction.user.update({
        where: {
          email: validationResetPassword.email,
        },
        data: {
          password: resetPasswordDto.password,
        },
      });
      return true;
    });
  }
}
