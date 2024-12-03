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

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  // async update(
  //   reviewId: bigint,
  //   imageResources: Array<Express.Multer.File>,
  //   updateReviewDto: UpdateReviewDto,
  // ) {
  //   const validatedUpdateReviewDto = this.validationService.validate(
  //     ReviewValidation.SAVE,
  //     updateReviewDto,
  //   );
  //   return this.prismaService.$transaction(async (prismaTransaction) => {
  //     await prismaTransaction.user
  //       .findFirstOrThrow({
  //         where: {
  //           uniqueId: this.expressRequest['user']['uniqueId'],
  //         },
  //         select: {
  //           Order: {
  //             where: {
  //               id: validatedUpdateReviewDto.orderId,
  //             },
  //           },
  //         },
  //       })
  //       .catch(() => {
  //         throw new NotFoundException(
  //           `User with unique id ${this.expressRequest['user']['uniqueId']} not found`,
  //         );
  //       });
  //     await prismaTransaction.review
  //       .findFirstOrThrow({
  //         where: {
  //           id: reviewId,
  //           Order: {
  //             assistantId: validatedUpdateReviewDto.assistantId,
  //             userId: this.expressRequest['user']['uniqueId'],
  //           },
  //         },
  //       })
  //       .catch(() => {
  //         throw new NotFoundException(`Review not found`);
  //       });
  //     await prismaTransaction.review.update({
  //       where: {
  //         id: reviewId,
  //       },
  //       data: {
  //         ...validatedUpdateReviewDto,
  //       },
  //     });
  //     await prismaTransaction.reviewResource.deleteMany({
  //       where: {
  //         imagePath: {
  //           in: validatedUpdateReviewDto.removedResourcePaths,
  //         },
  //       },
  //     });
  //     for (const removedResourcePath of validatedUpdateReviewDto.removedResourcePaths) {
  //       fs.unlink(
  //         `${this.configService.get<string>('MULTER_DEST')}
  //         /review-resources/${validatedUpdateReviewDto.orderId}/${validatedUpdateReviewDto.assistantId}/${removedResourcePath}`,
  //         () => {
  //           throw new HttpException(
  //             `Error when trying to delete resource`,
  //             500,
  //           );
  //         },
  //       );
  //     }
  //     const pathImageResources = [];
  //     for (const imageResource of imageResources) {
  //       const pathImageResource = await CommonHelper.handleSaveFile(
  //         this.configService,
  //         imageResource,
  //         `review-resources/${validatedUpdateReviewDto.orderId}/${validatedUpdateReviewDto.assistantId}/`,
  //       );
  //       pathImageResources.push({
  //         imagePath: pathImageResource,
  //         reviewId: reviewId,
  //       });
  //     }
  //     await prismaTransaction.reviewResource.createMany({
  //       data: pathImageResources,
  //     });
  //     return `Success! review has been updated`;
  //   });
  // }

  // async remove(reviewId: bigint, deleteReviewDto: DeleteReviewDto) {
  //   const validatedDeleteReviewDto = this.validationService.validate(
  //     ReviewValidation.DELETE,
  //     deleteReviewDto,
  //   );
  //   return this.prismaService.$transaction(async (prismaTransaction) => {
  //     const orderPrisma = await prismaTransaction.order
  //       .findFirst({
  //         where: {
  //           id: validatedDeleteReviewDto.orderId,
  //           assistantId: validatedDeleteReviewDto.assistantId,
  //           user: {
  //             uniqueId: this.expressRequest['user']['uniqueId'],
  //           },
  //         },
  //         select: {
  //           id: true,
  //           assistantId: true,
  //           userId: true,
  //         },
  //       })
  //       .catch(() => {
  //         throw new NotFoundException(
  //           'Order with the specified details not found',
  //         );
  //       });
  //
  //     await prismaTransaction.review.findFirstOrThrow({
  //       where: {
  //         id: reviewId,
  //         Order: {
  //           id: orderPrisma.id,
  //           assistantId: orderPrisma.assistantId,
  //         },
  //       },
  //     });
  //
  //     await prismaTransaction.review.deleteMany({
  //       where: {
  //         id: reviewId,
  //         Order: {
  //           id: orderPrisma.id,
  //           assistantId: orderPrisma.assistantId,
  //         },
  //       },
  //     });
  //     return `Success! review has been deleted`;
  //   });
  // }
}
