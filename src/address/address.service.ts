import { HttpException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { AddressValidation } from './address.validation';
import { Address } from '@prisma/client';
import { ResponseAddressDto } from './dto/response-address.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import ConvertHelper from '../helper/convert.helper';

@Injectable()
export class AddressService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    userId: bigint,
    createAddressDto: CreateAddressDto,
  ): Promise<string> {
    const validateAddress: CreateAddressDto = this.validationService.validate(
      AddressValidation.SAVE,
      createAddressDto,
    );

    await this.prismaService.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });

    await this.prismaService.address.create({
      data: { ...validateAddress, userId: userId },
    });
    return 'Success! new address has been created';
  }

  async findAllByUserId(userId: bigint): Promise<ResponseAddressDto[]> {
    const allAddressByUser: Address[] =
      await this.prismaService.address.findMany({
        where: {
          userId: userId,
        },
      });

    const allResponseAddressDto: ResponseAddressDto[] = [];
    for (const addressByUser of allAddressByUser) {
      const responseAddressDto: ResponseAddressDto =
        await ConvertHelper.addressPrismaIntoAddressResponse(addressByUser);
      allResponseAddressDto.push(responseAddressDto);
    }
    return allResponseAddressDto;
  }

  async update(
    userId: bigint,
    addressId: bigint,
    updateAddressDto: UpdateAddressDto,
  ): Promise<string> {
    const validateUpdateAddressDto: UpdateUserDto =
      this.validationService.validate(AddressValidation.SAVE, updateAddressDto);
    let addressPrisma: Address = await this.prismaService.address
      .findFirstOrThrow({
        where: {
          id: addressId,
          userId: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });
    addressPrisma = {
      ...addressPrisma,
      ...validateUpdateAddressDto,
    };
    await this.prismaService.address.update({
      data: addressPrisma,
      where: {
        id: addressId,
      },
    });
    return 'Success! address has been updated';
  }

  async remove(userId: bigint, addressId: bigint): Promise<string> {
    const searchedAddress: Address = await this.prismaService.address
      .findFirstOrThrow({
        where: {
          id: addressId,
          userId: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason, 400);
      });
    await this.prismaService.address.delete({
      where: {
        id: searchedAddress.id,
      },
    });
    return 'Success! address has been deleted';
  }
}
