import { PartialType } from '@nestjs/swagger';
import { CreateCoinOrderDto } from './create-coin-order.dto';

export class UpdateCoinDto extends PartialType(CreateCoinOrderDto) {}
