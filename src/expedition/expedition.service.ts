import { HttpException, Injectable } from '@nestjs/common';
import { CreateExpeditionDto } from './dto/create-expedition.dto';
import { UpdateExpeditionDto } from './dto/update-expedition.dto';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { ExpeditionValidation } from './expedition.validation';
import { Expedition } from '@prisma/client';
import { ResponseExpeditionDto } from './dto/response-expedition.dto';
import ConvertHelper from '../helper/convert.helper';

@Injectable()
export class ExpeditionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createExpeditionDto: CreateExpeditionDto) {
    const validatedCreateExpedition = await this.validationService.validate(
      ExpeditionValidation.SAVE,
      createExpeditionDto,
    );
    await this.prismaService.expedition.create({
      data: validatedCreateExpedition,
    });
    return 'Success! new expedition has been created!';
  }

  async findAll(): Promise<ResponseExpeditionDto[]> {
    const allExpeditionPrisma: Expedition[] =
      await this.prismaService.expedition.findMany({});
    const allExpeditionResponse: ResponseExpeditionDto[] = [];
    for (const expeditionPrisma of allExpeditionPrisma) {
      allExpeditionResponse.push(
        await ConvertHelper.expeditionPrismaIntoExpeditionResponse(
          expeditionPrisma,
        ),
      );
    }
    return allExpeditionResponse;
  }

  async findOne(id: number): Promise<ResponseExpeditionDto> {
    const expeditionPrisma: Expedition = await this.prismaService.expedition
      .findFirstOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });
    return ConvertHelper.expeditionPrismaIntoExpeditionResponse(
      expeditionPrisma,
    );
  }

  async update(id: number, updateExpeditionDto: UpdateExpeditionDto) {
    const validatedExpeditionDto = this.validationService.validate(
      ExpeditionValidation.SAVE,
      updateExpeditionDto,
    );
    await this.prismaService.expedition
      .findFirstOrThrow({
        where: {
          id: id,
        },
      })
      .catch((reason) => {
        throw new HttpException(reason.message, 400);
      });
    await this.prismaService.expedition.update({
      where: {
        id: id,
      },
      data: validatedExpeditionDto,
    });
    return 'Success! expedition data  has been updated!';
  }

  async remove(id: number) {
    const deletedExpedition = await this.prismaService.expedition.delete({
      where: {
        id: id,
      },
    });
    if (deletedExpedition == null) {
      throw new HttpException('Expedition not found', 404);
    }
    return `Success! expedition data has been deleted`;
  }
}