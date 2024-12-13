import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MentorService } from './mentor.service';
import { WebResponse } from '../model/web.response';
import {
  RegisterMentorDto,
  RegisterMentorResourceDto,
} from './dto/register-mentor.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';
import { NoVerifiedEmail } from '../authentication/decorator/set-no-verified-email.decorator';
import { ResponseAuthenticationDto } from '../authentication/dto/response-authentication';
import { Public } from 'src/authentication/decorator/set-metadata.decorator';
import { UpdateBankAccountMentorDto } from './dto/update-bank-account-mentor.dto';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'curriculumVitae', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'identityCard', maxCount: 1 },
    ]),
  )
  @NoVerifiedEmail(true)
  async create(
    @UploadedFiles()
    files: RegisterMentorResourceDto,
    @Body() registerMentorDto: RegisterMentorDto,
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<ResponseAuthenticationDto>> {
    return {
      result: {
        data: await this.mentorService.create(
          files,
          currentUser,
          registerMentorDto,
        ),
      },
    };
  }

  @Get('orders')
  async findAllOrder(
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.handleFindAllOrder(currentUser),
      },
    };
  }

  @Post('orders/booking')
  async updateBookingCondition(
    @Body()
    updateBookingCondition: {
      orderId: string;
      bookingCondition: string;
    },
    @CurrentUser() currentUser: LoggedUser,
  ) {
    return {
      result: {
        data: await this.mentorService.handleBookingCondition(
          currentUser,
          updateBookingCondition,
        ),
      },
    };
  }

  @Get('settings')
  async findOneSettings(@CurrentUser() currentUser: LoggedUser) {
    return {
      result: {
        data: await this.mentorService.handleFindOneSetting(currentUser),
      },
    };
  }

  @Get('settings/mentor-account')
  async findMentorAccount(
    @CurrentUser() currentUser: LoggedUser,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.handleFindMentorAccount(currentUser),
      },
    };
  }

  @Put('settings/mentor-account')
  async updateMentorAccount(
    @Body() updateBankAccountMentorDto: UpdateBankAccountMentorDto,
    @CurrentUser()
    currentUser: LoggedUser,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.handleUpdateMentorAccount(
          currentUser,
          updateBankAccountMentorDto,
        ),
      },
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Get('educations/:userUniqueId')
  async fetchMentorEducation(
    @Param('userUniqueId') userUniqueId: string,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.handleFindMentorEducation(userUniqueId),
      },
    };
  }

  @Post(`orders/booking/reject`)
  async rejectBooking(
    @Body()
    rejectBookingDto: {
      orderId: string;
      reason: string;
    },
    @CurrentUser() currentUser: LoggedUser,
  ) {
    return {
      result: {
        data: await this.mentorService.handleRejectBooking(rejectBookingDto),
      },
    };
  }

  @Public()
  @NoVerifiedEmail(true)
  @Get('experiences/:userUniqueId')
  async fetchMentorExperience(@Param('userUniqueId') userUniqueId: string) {
    return {
      result: {
        data: await this.mentorService.handleFindMentorExperience(userUniqueId),
      },
    };
  }

  @Public()
  @Get(':uniqueId')
  async findOne(
    @Param('uniqueId') uniqueId: string,
  ): Promise<WebResponse<any>> {
    return {
      result: {
        data: await this.mentorService.findOne(uniqueId),
      },
    };
  }

  @Post('orders/booking/:orderId')
  async updateBookingMeetingLink(
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: LoggedUser,
    @Body()
    updateBookingMeetingLinkDto: {
      meetingPlatform: string;
      meetingPasskey: string;
      meetingLink: string;
    },
  ) {
    return {
      result: {
        data: await this.mentorService.handleUpdateBookingMeetingLink(
          updateBookingMeetingLinkDto,
          orderId,
          currentUser,
        ),
      },
    };
  }
}
