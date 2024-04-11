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
import ResponseAddressDto from './dto/response-address.dto';

@Controller('api/users/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post(':userId')
  async create(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.addressService.create(userId, createAddressDto),
      },
    };
  }

  @Get(':userId')
  async findAllByUserId(
    @Param('userId', ParseIntPipe) userId: bigint,
  ): Promise<WebResponse<ResponseAddressDto[]>> {
    return {
      result: {
        data: await this.addressService.findAllByUserId(userId),
      },
    };
  }

  @Put(':userId/:addressId')
  async update(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('addressId', ParseIntPipe) addressId: bigint,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.addressService.update(
          userId,
          addressId,
          updateAddressDto,
        ),
      },
    };
  }

  @Delete(':userId/:addressId')
  async remove(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Param('addressId', ParseIntPipe) addressId: bigint,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.addressService.remove(userId, addressId),
      },
    };
  }
}
