import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoinService } from './coin.service';
import { CreateCoinOrderDto } from './dto/create-coin-order.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { CurrentUser } from '../authentication/decorator/current-user.decorator';
import { WebResponse } from '../model/web.response';
import LoggedUser from '../authentication/dto/logged-user.dto';

@Controller('coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Post()
  async createOrder(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() createCoinOrderDto: CreateCoinOrderDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        data: await this.coinService.handleCoinOrder(
          loggedUser,
          createCoinOrderDto,
        ),
      },
    };
  }

  @Get()
  findAll() {
    return this.coinService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.coinService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateCoinDto: UpdateCoinDto,
  ) {
    return this.coinService.update(+id, updateCoinDto);
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.coinService.remove(+id);
  }
}
