import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import DeleteReviewDto from './dto/delete-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imageResources'))
  create(
    @UploadedFiles() imageResources: Array<Express.Multer.File>,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(imageResources, createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':reviewId')
  @UseInterceptors(FilesInterceptor('imageResources'))
  update(
    @UploadedFiles() imageResources: Array<Express.Multer.File>,
    @Param('reviewId', ParseIntPipe) reviewId: bigint,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(reviewId, imageResources, updateReviewDto);
  }

  @Delete(':reviewId')
  remove(
    @Param('reviewId', ParseIntPipe) reviewId: bigint,
    @Body() deleteReviewDto: DeleteReviewDto,
  ) {
    return this.reviewService.remove(reviewId, deleteReviewDto);
  }
}
