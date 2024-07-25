import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { AssistanceValidation } from './assistance.validation';

@Injectable()
export class AssistanceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}
  async create(mentorId: bigint, createAssistanceDto: CreateAssistanceDto) {
    const validatedCreateAssistanceDto = this.validationService.validate(
      AssistanceValidation.SAVE,
      createAssistanceDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: mentorId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Mentor with mentorId ${mentorId} not found`,
          );
        });
      prismaTransaction.category
        .findFirstOrThrow({
          where: {
            id: createAssistanceDto.categoryId,
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Category with categoryId ${createAssistanceDto.categoryId} not found`,
          );
        });
    });
    return 'This action adds a new assistance';
  }

  findAll() {
    return `This action returns all assistance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assistance`;
  }

  update(id: number, updateAssistanceDto: UpdateAssistanceDto) {
    return `This action updates a #${id} assistance`;
  }

  remove(id: number) {
    return `This action removes a #${id} assistance`;
  }
}
