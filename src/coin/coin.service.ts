import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoinOrderDto } from './dto/create-coin-order.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import { CoinValidation } from './coin.validation';
import PrismaService from '../common/prisma.service';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { CoinOrder, User } from '@prisma/client';
import { MidtransCreateOrderDtoBuilder } from '../order/dto/midtrans-create-order.dto';
import { MidtransService } from '../common/midtrans.service';

@Injectable()
export class CoinService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    private readonly midtransService: MidtransService,
  ) {}

  handleCoinOrder(
    loggedUser: LoggedUser,
    createCoinOrderDto: CreateCoinOrderDto,
  ): Promise<string> {
    const validatedCreateCoinOrderDto = this.validationService.validate(
      CoinValidation.CREATE,
      createCoinOrderDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
        })
        .catch(() => {
          throw new NotFoundException(`User not found`);
        });

      const createCoinOrderPayload = {
        coinAmount: validatedCreateCoinOrderDto.coinAmount as number,
        totalPrice: validatedCreateCoinOrderDto.totalPrice as number,
        user: {
          connect: { id: userPrisma.id },
        },
        createdAt: new Date(),
      };
      const newCreatedCoinOrder = await prismaTransaction.coinOrder.create({
        data: createCoinOrderPayload,
      });
      const [firstName, ...partedLastName] = userPrisma.name.split(' ');
      const lastName = partedLastName.join(' ');
      const midtransCreateOrderPayload = new MidtransCreateOrderDtoBuilder()
        .setTransactionDetails(
          newCreatedCoinOrder.id,
          newCreatedCoinOrder.totalPrice,
        )
        .setCreditCard(true)
        .setCustomerDetails(
          firstName,
          lastName,
          userPrisma.email,
          userPrisma.telephone,
        )
        .build();
      const transactionResponse = await this.midtransService
        .getSnapTransaction()
        .createTransaction(midtransCreateOrderPayload);
      const transactionToken = transactionResponse.token;
      await prismaTransaction.coinOrder
        .update({
          data: {
            transactionToken: transactionToken,
          },
          where: {
            id: newCreatedCoinOrder.id,
          },
        })
        .catch(() => {
          throw new HttpException(`Error when trying to init payment`, 500);
        });
      return transactionToken;
    });
  }

  async findAllByUserId(loggedUser: LoggedUser): Promise<CoinOrder[]> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const { id: userId } = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: loggedUser.uniqueId,
          },
          select: {
            id: true,
          },
        })
        .catch(() => {
          throw new NotFoundException(`User not found`);
        });
      return prismaTransaction.coinOrder.findMany({
        where: {
          userId: userId,
        },
      });
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} coin`;
  }

  update(id: number, updateCoinDto: UpdateCoinDto) {
    return `This action updates a #${id} coin`;
  }

  remove(id: number) {
    return `This action removes a #${id} coin`;
  }
}
