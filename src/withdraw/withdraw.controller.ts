import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WebResponse } from '../model/web.response';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import LoggedUser from '../authentication/dto/logged-user.dto';

@Controller('withdraws')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post('')
  async create(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() createWithdrawDto: CreateWithdrawDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.withdrawService.handleWithdrawRequest(
          loggedUser,
          createWithdrawDto,
        ),
      },
    };
  }

  @Post('confirm')
  async confirmWithdrawRequest(
    @Body() confirmWithdrawDto: { withdrawId: string },
  ) {
    console.log(confirmWithdrawDto);
    return {
      result: {
        data: await this.withdrawService.handleConfirmWithdrawRequest(
          confirmWithdrawDto,
        ),
      },
    };
  }

  @Get()
  async findAll() {
    return {
      result: {
        data: await this.withdrawService.findAll(),
      },
    };
  }

  @Get('self')
  async findOne(@CurrentUser() loggedUser: LoggedUser) {
    return {
      result: {
        data: await this.withdrawService.findOne(loggedUser),
      },
    };
  }
}
