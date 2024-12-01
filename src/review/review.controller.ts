import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    console.log(createReviewDto);
    return {
      result: {
        data: await this.reviewService.create(createReviewDto),
      },
    };
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  // @Patch(':reviewId')
  // @UseInterceptors(FilesInterceptor('imageResources'))
  // update(
  //   @UploadedFiles() imageResources: Array<Express.Multer.File>,
  //   @Param('reviewId', ParseIntPipe) reviewId: bigint,
  //   @Body() updateReviewDto: UpdateReviewDto,
  // ) {
  //   return this.reviewService.update(reviewId, imageResources, updateReviewDto);
  // }
  //
  // @Delete(':reviewId')
  // remove(
  //   @Param('reviewId', ParseIntPipe) reviewId: bigint,
  //   @Body() deleteReviewDto: DeleteReviewDto,
  // ) {
  //   return this.reviewService.remove(reviewId, deleteReviewDto);
  // }
}
