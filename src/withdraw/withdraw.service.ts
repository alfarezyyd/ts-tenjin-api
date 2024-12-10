import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { WithdrawValidation } from './withdraw.validation';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { MentorBankAccount, WithdrawPaymentStatus } from '@prisma/client';

@Injectable()
export class WithdrawService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async handleWithdrawRequest(
    loggedUser: LoggedUser,
    createWithdrawDto: CreateWithdrawDto,
  ): Promise<string> {
    const validatedCreateWithdrawDto = this.validationService.validate(
      WithdrawValidation.CREATE,
      createWithdrawDto,
    );
    console.log(createWithdrawDto);
    console.log(validatedCreateWithdrawDto);
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const mentorPrisma = await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            user: {
              uniqueId: loggedUser.uniqueId,
            },
          },
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                totalBalance: true,
              },
            },
          },
        })
        .catch(() => {
          throw new NotFoundException('Mentor data not found');
        });
      const mentorBankAccount: MentorBankAccount =
        await prismaTransaction.mentorBankAccount
          .findFirstOrThrow({
            where: {
              mentorId: mentorPrisma.id,
              id: validatedCreateWithdrawDto.bankAccountId,
            },
          })
          .catch(() => {
            throw new NotFoundException('Mentor bank account data not found');
          });
      if (
        mentorPrisma.user.totalBalance < validatedCreateWithdrawDto.totalBalance
      ) {
        throw new BadRequestException('Balance not sufficient');
      }
      await prismaTransaction.user.update({
        where: {
          id: mentorPrisma.user.id,
        },
        data: {
          totalBalance:
            mentorPrisma.user.totalBalance -
            BigInt(validatedCreateWithdrawDto.totalBalance),
        },
      });
      console.log(validatedCreateWithdrawDto);
      await prismaTransaction.withdrawRequest.create({
        data: {
          userId: mentorPrisma.userId,
          mentorId: mentorPrisma.id,
          mentorBankAccountId: mentorBankAccount.id,
          totalBalance: validatedCreateWithdrawDto.totalBalance,
        },
      });

      return 'Withdraw request successfully created';
    });
  }

  async findAll() {
    return this.prismaService.withdrawRequest.findMany({
      include: {
        user: true,
        mentorBankAccount: true,
      },
    });
  }

  async findOne(currentUser: LoggedUser) {
    return this.prismaService.withdrawRequest.findMany({
      where: {
        user: {
          uniqueId: currentUser.uniqueId,
        },
      },
      include: {
        user: true,
        mentorBankAccount: true,
      },
    });
  }

  async handleConfirmWithdrawRequest(confirmWithdrawDto: {
    withdrawId: string;
  }) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.withdrawRequest
        .findFirstOrThrow({
          where: {
            id: confirmWithdrawDto.withdrawId,
          },
        })
        .catch(() => {
          throw new NotFoundException('Withdraw request not found');
        });
      await prismaTransaction.withdrawRequest.update({
        where: {
          id: confirmWithdrawDto.withdrawId,
        },
        data: {
          withdrawPaymentStatus: WithdrawPaymentStatus.SENT,
          sentAt: new Date(),
        },
      });
      return 'Withdraw request successfully confirmed';
    });
  }
}
