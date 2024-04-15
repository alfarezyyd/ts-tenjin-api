import { HttpException, Injectable } from '@nestjs/common';
import { CreateExpeditionDto } from './dto/create-expedition.dto';
import { UpdateExpeditionDto } from './dto/update-expedition.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { ExpeditionValidation } from './expedition.validation';
import { Expedition, ExpeditionProvince } from '@prisma/client';
import ResponseExpeditionDto from './dto/response-expedition.dto';
import ConvertHelper from '../helper/convert.helper';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ExpeditionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createExpeditionDto: CreateExpeditionDto): Promise<string> {
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

  async findOne(expeditionId: number): Promise<ResponseExpeditionDto> {
    const expeditionPrisma: Expedition = await this.prismaService.expedition
      .findFirstOrThrow({
        where: {
          id: expeditionId,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Expedition with expeditionId ${expeditionId} not found`,
          404,
        );
      });
    return ConvertHelper.expeditionPrismaIntoExpeditionResponse(
      expeditionPrisma,
    );
  }

  async update(expeditionId: number, updateExpeditionDto: UpdateExpeditionDto) {
    const validatedExpeditionDto = this.validationService.validate(
      ExpeditionValidation.SAVE,
      updateExpeditionDto,
    );
    await this.prismaService.expedition
      .findFirstOrThrow({
        where: {
          id: expeditionId,
        },
      })
      .catch(() => {
        throw new HttpException(
          `Expedition with expeditionId ${expeditionId}`,
          404,
        );
      });
    await this.prismaService.expedition.update({
      where: {
        id: expeditionId,
      },
      data: validatedExpeditionDto,
    });
    return `Success! expedition with expeditionId ${expeditionId} has been updated!`;
  }

  async remove(expeditionId: number) {
    const deletedExpedition = await this.prismaService.expedition.delete({
      where: {
        id: expeditionId,
      },
    });
    if (deletedExpedition == null) {
      throw new HttpException(
        `Expedition with expeditionId ${expeditionId} not found`,
        404,
      );
    }
    return `Success! expedition with expeditionId ${expeditionId} has been deleted`;
  }

  async syncThirdPartyProvince() {
    await firstValueFrom(
      this.httpService.get(
        `${this.configService.get<string>('RAJAONGKIR_ENDPOINT')}/province`,
        {
          headers: {
            key: this.configService.get<string>('RAJAONGKIR_API_KEY'),
          },
        },
      ),
    )
      .then(async (response) => {
        if (response.status == 200) {
          const allExpeditionProvincePrisma: ExpeditionProvince[] = [];
          response.data.rajaongkir.results.forEach(
            (result: { province_id: string; province: string }) => {
              const expeditionProvincePrisma: ExpeditionProvince = {
                id: parseInt(result.province_id),
                name: result.province,
              };
              allExpeditionProvincePrisma.push(expeditionProvincePrisma);
            },
          );
          await this.prismaService
            .$transaction(async (prismaInstance) => {
              await prismaInstance.expeditionProvince.deleteMany({});
              await prismaInstance.expeditionProvince.createMany({
                data: allExpeditionProvincePrisma,
                skipDuplicates: true,
              });
            })
            .catch(() => {
              throw new AxiosError(
                'Error when trying to sync province!',
                '500',
              );
            });
        } else {
          throw new AxiosError('Error when trying to sync province!', '500');
        }
      })
      .catch((error) => {
        console.log(error);
        throw new AxiosError('Error when trying to sync province!', '500');
      });
  }
}
