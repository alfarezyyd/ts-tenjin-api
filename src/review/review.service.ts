import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ConfigService } from '@nestjs/config';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { REQUEST } from '@nestjs/core';
import ReviewValidation from './review.validation';
import CommonHelper from '../helper/common.helper';

@Injectable({ scope: Scope.REQUEST })
export class ReviewService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}
  create(
    imageResources: Array<Express.Multer.File>,
    createReviewDto: CreateReviewDto,
  ) {
    const validatedCreateReviewDto = this.validationService.validate(
      ReviewValidation.SAVE,
      createReviewDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.order
        .findFirstOrThrow({
          where: {
            id: validatedCreateReviewDto.orderId,
            assistanceId: validatedCreateReviewDto.assistantId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Order with id ${validatedCreateReviewDto.orderId} not found`,
          );
        });
      const { rating, review } = { ...validatedCreateReviewDto };
      const reviewPrisma = await prismaTransaction.review.create({
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
          Assistance: {
            connect: {
              id: validatedCreateReviewDto.assistantId,
            },
          },
        },
      });
      const pathImageResources = [];
      for (const imageResource of imageResources) {
        const pathImageResource = await CommonHelper.handleSaveFile(
          this.configService,
          imageResource,
          `review-resources/${validatedCreateReviewDto.orderId}/${validatedCreateReviewDto.assistantId}/`,
        );
        pathImageResources.push({
          imagePath: pathImageResource,
          reviewId: reviewPrisma.id,
        });
      }
      await prismaTransaction.reviewResource.createMany({
        data: pathImageResources,
      });
      return `Success! review has been created`;
    });
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
