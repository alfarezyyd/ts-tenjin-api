// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Post,
// } from '@nestjs/common';
// import { CoinService } from './coin.service';
// import { CreateCoinOrderDto } from './dto/create-coin-order.dto';
// import { UpdateCoinDto } from './dto/update-coin.dto';
// import { CurrentUser } from '../authentication/decorator/current-user.decorator';
// import { WebResponse } from '../model/web.response';
// import LoggedUser from '../authentication/dto/logged-user.dto';
// import { TopUpBalance } from '@prisma/client';
//
// @Controller('coins')
// export class CoinController {
//   constructor(private readonly coinService: CoinService) {}
//
//   @Post()
//   async createOrder(
//     @CurrentUser() loggedUser: LoggedUser,
//     @Body() createCoinOrderDto: CreateCoinOrderDto,
//   ): Promise<WebResponse<string>> {
//     return {
//       result: {
//         data: await this.coinService.handleCoinOrder(
//           loggedUser,
//           createCoinOrderDto,
//         ),
//       },
//     };
//   }
//
//   @Get()
//   async findAllByUserId(
//     @CurrentUser() loggedUser: LoggedUser,
//   ): Promise<WebResponse<TopUpBalance[]>> {
//     return {
//       result: {
//         data: await this.coinService.findAllByUserId(loggedUser),
//       },
//     };
//   }
//
//   @Get(':id')
//   findOne(
//     @Param('id')
//     id: string,
//   ) {
//     return this.coinService.findOne(+id);
//   }
//
//   @Patch(':id')
//   update(
//     @Param('id')
//     id: string,
//     @Body()
//     updateCoinDto: UpdateCoinDto,
//   ) {
//     return this.coinService.update(+id, updateCoinDto);
//   }
//
//   @Delete(':id')
//   remove(
//     @Param('id')
//     id: string,
//   ) {
//     return this.coinService.remove(+id);
//   }
// }
