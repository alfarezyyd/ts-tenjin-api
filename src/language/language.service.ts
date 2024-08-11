import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { LanguageValidation } from './language.validation';

@Injectable()
export class LanguageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createLanguageDto: CreateLanguageDto) {
    const validatedCreateLanguageDto = this.validationService.validate(
      LanguageValidation.SAVE,
      createLanguageDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.language.create({
        data: createLanguageDto,
      });
    });
    return 'Success! new language has been created';
  }

  async findAll() {
    return this.prismaService.language.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} language`;
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    const validatedUpdateLanguageDto = this.validationService.validate(
      LanguageValidation.SAVE,
      updateLanguageDto,
    );
    this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.language
        .findFirstOrThrow({
          where: {
            id: id,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Failed! language with languageId ${id} not found`,
          );
        });
      await prismaTransaction.language.update({
        data: validatedUpdateLanguageDto,
        where: {
          id: id,
        },
      });
    });
    return `Success! language with id ${id} has been updated`;
  }

  remove(id: number) {
    return `This action removes a #${id} language`;
  }
}
