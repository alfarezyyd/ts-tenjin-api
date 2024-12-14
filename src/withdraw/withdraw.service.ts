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
import { UserBankAccount, WithdrawPaymentStatus } from '@prisma/client';

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
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
          select: {
            id: true,
            totalBalance: true,
          },
        })
        .catch(() => {
          throw new NotFoundException('User  not found');
        });
      const userBankAccount: UserBankAccount =
        await prismaTransaction.userBankAccount
          .findFirstOrThrow({
            where: {
              userId: userPrisma.id,
              id: validatedCreateWithdrawDto.bankAccountId,
            },
          })
          .catch(() => {
            throw new NotFoundException(
              'User bank account data not found, please change it in setting',
            );
          });
      if (userPrisma.totalBalance < validatedCreateWithdrawDto.totalBalance) {
        throw new BadRequestException('Balance not sufficient');
      }
      await prismaTransaction.user.update({
        where: {
          id: userPrisma.id,
        },
        data: {
          totalBalance:
            userPrisma.totalBalance -
            BigInt(validatedCreateWithdrawDto.totalBalance),
        },
      });
      console.log(validatedCreateWithdrawDto);
      await prismaTransaction.withdrawRequest.create({
        data: {
          totalBalance: validatedCreateWithdrawDto.totalBalance,
          user: {
            connect: {
              id: userPrisma.id,
            },
          },
          userBankAccount: {
            connect: {
              id: userBankAccount.id,
            },
          },
        },
      });

      return 'Withdraw request successfully created';
    });
  }

  async;

  findAll() {
    return this.prismaService.withdrawRequest.findMany({
      include: {
        user: true,
        userBankAccount: true,
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
        userBankAccount: true,
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
