import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { WithdrawValidation } from './withdraw.validation';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { Mentor, MentorBankAccount } from '@prisma/client';
import { Withdraw } from './entities/withdraw.entity';

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
      const mentorPrisma: Mentor = await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            user: {
              uniqueId: loggedUser.uniqueId,
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
      await prismaTransaction.withdrawRequest.create({
        data: {
          userId: mentorPrisma.userId,
          mentorId: mentorPrisma.id,
          mentorBankAccountId: mentorBankAccount.id,
          totalCoin: validatedCreateWithdrawDto.totalCoin,
        },
      });
      return 'Withdraw request successfully created';
    });
  }

  findAll() {
    return `This action returns all withdraw`;
  }

  findOne(id: number) {
    return `This action returns a #${id} withdraw`;
  }

  update(id: number, updateWithdrawDto: UpdateWithdrawDto) {
    return `This action updates a #${id} withdraw`;
  }

  remove(id: number) {
    return `This action removes a #${id} withdraw`;
  }
}
