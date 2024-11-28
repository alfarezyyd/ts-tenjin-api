import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
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

  @Get()
  findAll() {
    return this.withdrawService.findAll();
  }

  @Get(':uniqueId')
  async findOne(@Param('id') id: string) {
    return {
      result: {
        data: await this.withdrawService.findOne(+id),
      },
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWithdrawDto: UpdateWithdrawDto,
  ) {
    return this.withdrawService.update(+id, updateWithdrawDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.withdrawService.remove(+id);
  }
}
