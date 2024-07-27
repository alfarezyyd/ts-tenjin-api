import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import SkillValidation from './skill.validation';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class SkillService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly expressRequest: Request,
  ) {}

  async create(createSkillDto: CreateSkillDto) {
    const validatedCreateSkillDto = this.validationService.validate(
      SkillValidation.SAVE,
      createSkillDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.skill.create({
        data: {
          ...validatedCreateSkillDto,
          mentorId: this.expressRequest['user']['mentorId'],
        },
      });
    });
    return 'Success! new skill has been created';
  }

  findAll() {
    return `This action returns all skill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  async update(skillId: bigint, updateSkillDto: UpdateSkillDto) {
    const validatedCreateSkillDto = this.validationService.validate(
      SkillValidation.UPDATE,
      updateSkillDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.mentor
        .findFirstOrThrow({
          where: {
            id: this.expressRequest['user']['mentorId'],
          },
        })
        .catch(() => {
          throw new NotFoundException(
            `Mentor with mentorId ${this.expressRequest['user']['mentorId']} not found`,
          );
        });
      await prismaTransaction.skill.updateMany({
        data: {
          ...validatedCreateSkillDto,
          mentorId: this.expressRequest['user']['mentorId'],
        },
        where: {
          AND: [
            { id: skillId },
            { mentorId: this.expressRequest['user']['mentorId'] },
          ],
        },
      });
    });
    return 'Success! new skill has been updated';
  }

  async remove(skillId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const skillModel = await prismaTransaction.skill.deleteMany({
        where: {
          AND: [
            { id: skillId },
            { mentorId: this.expressRequest['user']['mentorId'] },
          ],
        },
      });
      if (skillModel == null) {
        throw new HttpException(
          `Skill with skillId ${skillId} not found!`,
          500,
        );
      }
    });
    return `Success! skill with skillId ${skillId} has been deleted`;
  }
}
