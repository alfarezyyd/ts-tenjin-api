import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { REQUEST } from '@nestjs/core';
import ReviewValidation from './review.validation';
import { OrderStatus } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const validatedCreateReviewDto = this.validationService.validate(
      ReviewValidation.SAVE,
      createReviewDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrismaId = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: this.expressRequest['user']['uniqueId'],
          },
          select: {
            id: true,
          },
        })
        .catch(() => {
          throw new NotFoundException(`User not found`);
        });
      await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            id: validatedCreateReviewDto.orderId,
            assistantId: validatedCreateReviewDto.assistantId,
            userId: userPrismaId.id,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Order with id ${validatedCreateReviewDto.orderId} not found`,
          );
        });
      const { rating, review } = { ...validatedCreateReviewDto };
      await prismaTransaction.review.create({
        data: {
          rating: rating,
          review: review,
          createdAt: new Date(),
          updatedAt: null,
          Order: {
            connect: {
              id: validatedCreateReviewDto.orderId,
            },
          },
          User: {
            connect: {
              id: userPrismaId.id,
            },
          },
          Assistance: {
            connect: {
              id: validatedCreateReviewDto.assistantId,
            },
          },
        },
      });
      await prismaTransaction.order.update({
        where: {
          id: validatedCreateReviewDto.orderId,
          assistantId: validatedCreateReviewDto.assistantId,
          userId: userPrismaId.id,
        },
        data: {
          orderStatus: OrderStatus.REVIEWED,
        },
      });
      return `Success! review has been created`;
    });
  }

  findAll() {
    return `This action returns all review`;
  }

  async findOne(moreReviewDto: {
    mentorUniqueId: string;
    assistantId: number;
    lastReviewId: number;
  }) {
    console.log(moreReviewDto.lastReviewId);
    return this.prismaService.review.findMany({
      where: {
        Assistance: {
          id: moreReviewDto.assistantId,
          mentor: {
            user: {
              uniqueId: moreReviewDto.mentorUniqueId,
            },
          },
        },
        id: {
          gte: BigInt(moreReviewDto.lastReviewId + 1),
        },
      },
      take: 10,
    });
  }
}
