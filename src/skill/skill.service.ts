import { HttpException, Inject, Injectable, Scope } from '@nestjs/common';
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
    try {
      await this.prismaService.$transaction(async (prismaTransaction) => {
        prismaTransaction.skill.create({
          data: {
            ...validatedCreateSkillDto,
            mentorId: this.expressRequest['user']['mentorId'],
          },
        });
      });
    } catch (err) {
      throw new HttpException('Error occurred when trying to write!', 500);
    }
    return 'Success! new skill has been created';
  }

  findAll() {
    return `This action returns all skill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  async update(mentorId: bigint, updateSkillDto: UpdateSkillDto) {
    const validatedCreateSkillDto = this.validationService.validate(
      SkillValidation.UPDATE,
      updateSkillDto,
    );
    try {
      await this.prismaService.$transaction(async (prismaTransaction) => {
        prismaTransaction.mentor
          .findFirstOrThrow({
            where: {
              id: mentorId,
            },
          })
          .catch(() => {
            throw new HttpException(
              'Mentor with mentorId ${mentorId} not found',
              404,
            );
          });
        prismaTransaction.skill.update({
          data: { ...validatedCreateSkillDto, mentorId: mentorId },
          where: {
            id: updateSkillDto.skillId,
          },
        });
      });
    } catch (err) {
      throw new HttpException('Error occurred when trying to write!', 500);
    }
    return 'Success! new skill has been updated';
  }

  async remove(skillId: bigint) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const skillModel = await prismaTransaction.skill.delete({
        where: {
          id: skillId,
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
