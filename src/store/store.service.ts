import { HttpException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { StoreValidation } from './store.validation';
import { Store } from '@prisma/client';

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
      StoreValidation.CREATE,
      createStoreDto,
    );
    await this.prismaService.store.create({
      data: {
        ...createStoreRequest,
        userId: userId,
      },
    });
    return 'Success! the store have been created';
  }

  async findOne(userId: bigint, storeId: bigint): Promise<Store> {
    return this.prismaService.store
      .findFirstOrThrow({
        where: {
          id: storeId,
          userId: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message(), 400);
      });
  }

  async update(
    userId: bigint,
    storeId: bigint,
    updateStoreDto: UpdateStoreDto,
  ): Promise<string> {
    const updateStoreRequest = await this.validationService.validate(
      StoreValidation.UPDATE,
      updateStoreDto,
    );
    let storePrisma: Store = await this.prismaService.store
      .findFirstOrThrow({
        where: {
          id: storeId,
          userId: userId,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message(), 400);
      });
    storePrisma = {
      ...updateStoreRequest,
      ...storePrisma,
    };
    this.prismaService.store.update({
      where: {
        id: storeId,
        userId: userId,
      },
      data: storePrisma,
    });
    return `Success! store has been updated`;
  }

  async remove(userId: bigint, storeId: bigint): Promise<string> {
    const storePrisma: Store = await this.prismaService.store.delete({
      where: {
        id: storeId,
        userId: userId,
      },
    });
    if (storePrisma == null) {
      throw new HttpException('Store not found', 404);
    }
    return `Success! store has been deleted`;
  }
}
