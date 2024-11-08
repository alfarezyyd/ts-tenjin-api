import { Injectable } from '@nestjs/common';
import { CreateCoinOrderDto } from './dto/create-coin-order.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';

@Injectable()
export class CoinService {
  handleCoinOrder(createCoinOrderDto: CreateCoinOrderDto) {}

  findAll() {
    return `This action returns all coin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coin`;
  }

  update(id: number, updateCoinDto: UpdateCoinDto) {
    return `This action updates a #${id} coin`;
  }

  remove(id: number) {
    return `This action removes a #${id} coin`;
  }
}
