import { HttpException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { StoreValidation } from './store.validation';
import { Store } from '@prisma/client';
import { ResponseStoreDto } from './dto/response-store.dto';
import { ConvertHelper } from '../helper/convert.helper';

@Injectable()
export class StoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    userId: bigint,
    createStoreDto: CreateStoreDto,
  ): Promise<string> {
    const createStoreRequest = this.validationService.validate(
      StoreValidation.SAVE,
      createStoreDto,
    );

    await this.prismaService.user
      .findFirstOrThrow({
        where: {
          id: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });

    await this.prismaService.store.create({
      data: {
        ...createStoreRequest,
        userId: userId,
      },
    });
    return 'Success! the store have been created';
  }

  async findOne(userId: bigint): Promise<ResponseStoreDto> {
    return ConvertHelper.storePrismaIntoStoreResponse(
      await this.prismaService.store.findFirstOrThrow({
        where: {
          userId: userId,
        },
      }),
    ).catch((reason) => {
      throw new HttpException(reason.message, 400);
    });
  }

  async update(
    userId: bigint,
    updateStoreDto: UpdateStoreDto,
  ): Promise<string> {
    const updateStoreRequest = await this.validationService.validate(
      StoreValidation.SAVE,
      updateStoreDto,
    );
    let storePrisma: Store = await this.prismaService.store
      .findFirstOrThrow({
        where: {
          userId: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });
    storePrisma = {
      ...storePrisma,
      ...updateStoreRequest,
    };
    await this.prismaService.store.update({
      data: storePrisma,
      where: {
        userId: userId,
      },
    });
    return `Success! store has been updated`;
  }

  async remove(userId: bigint): Promise<string> {
    const storePrisma: Store = await this.prismaService.store.delete({
      where: {
        userId: userId,
      },
    });
    if (storePrisma == null) {
      throw new HttpException('Store not found', 404);
    }
    return `Success! store has been deleted`;
  }
}
