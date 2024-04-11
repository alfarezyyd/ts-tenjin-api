import { HttpException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from '@prisma/client';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import ConvertHelper from '../helper/convert.helper';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import AddressValidation from './address.validation';
import ResponseAddressDto from './dto/response-address.dto';

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
    const validatedCreateAddressDto: CreateAddressDto =
      this.validationService.validate(AddressValidation.SAVE, createAddressDto);

    await this.prismaService.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .catch(() => {
        throw new HttpException(`User with userId ${userId} not found`, 404);
      });

    await this.prismaService.address.create({
      data: { ...validatedCreateAddressDto, userId: userId },
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
      allResponseAddressDto.push(
        await ConvertHelper.addressPrismaIntoAddressResponse(addressByUser),
      );
    }
    return allResponseAddressDto;
  }

  async update(
    userId: bigint,
    addressId: bigint,
    updateAddressDto: UpdateAddressDto,
  ): Promise<string> {
    const validatedUpdateAddressDto: UpdateUserDto =
      this.validationService.validate(AddressValidation.SAVE, updateAddressDto);
    let addressPrisma: Address = await this.prismaService.address
      .findFirstOrThrow({
        where: {
          id: addressId,
          userId: userId,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Address with addressId ${addressId} and userId ${userId} not found`,
          404,
        );
      });
    addressPrisma = {
      ...addressPrisma,
      ...validatedUpdateAddressDto,
    };
    await this.prismaService.address.update({
      data: addressPrisma,
      where: {
        id: addressId,
        userId: userId,
      },
    });
    return `Success! address with addressId ${addressId} has been updated`;
  }

  async remove(userId: bigint, addressId: bigint): Promise<string> {
    const addressPrisma = await this.prismaService.address.delete({
      where: {
        id: addressId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });
    if (addressPrisma == null) {
      throw new HttpException(
        `Address with addressId ${addressId} and userId ${userId} not found!`,
        404,
      );
    }
    return `Success! address with addressId ${addressId} and userId ${userId} has been deleted`;
  }
}
