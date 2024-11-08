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

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Post()
  createOrder(@Body() createCoinOrderDto: CreateCoinOrderDto) {
    return this.coinService.handleCoinOrder(createCoinDto);
  }

  @Get()
  findAll() {
    return this.coinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoinDto: UpdateCoinDto) {
    return this.coinService.update(+id, updateCoinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coinService.remove(+id);
  }
}
