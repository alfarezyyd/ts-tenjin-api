import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { WebResponse } from '../model/web.response';
import { ResponseAddressDto } from './dto/response-address.dto';

@Controller('api/users/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post(':id')
  async create(
    @Param('id', ParseIntPipe) id: bigint,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.addressService.create(id, createAddressDto),
    };
  }

  @Get(':userId')
  async findAllByUserId(
    @Param('userId', ParseIntPipe) userId: bigint,
  ): Promise<WebResponse<ResponseAddressDto[]>> {
    const allAddressByUserId: ResponseAddressDto[] =
      await this.addressService.findAllByUserId(userId);
    return {
      data: allAddressByUserId,
    };
  }

  @Put(':userId/:addressId')
  async update(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('addressId', ParseIntPipe) addressId: bigint,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return {
      data: await this.addressService.update(
        userId,
        addressId,
        updateAddressDto,
      ),
    };
  }

  @Delete(':userId/:addressId')
  async remove(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('addressId', ParseIntPipe) addressId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      data: await this.addressService.remove(userId, addressId),
    };
  }
}
