import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { NoVerifiedEmail } from '../authentication/decorator/set-no-verified-email.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
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

  @Public()
  @NoVerifiedEmail(true)
  @Post('more-review')
  async findOne(
    @Body()
    moreReviewDto: {
      mentorUniqueId: string;
      assistantId: number;
      lastReviewId: number;
    },
  ) {
    console.log(moreReviewDto);
    return {
      result: {
        data: await this.reviewService.findOne(moreReviewDto),
      },
    };
  }
}
