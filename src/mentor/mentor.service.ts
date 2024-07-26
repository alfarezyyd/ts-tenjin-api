import { HttpException, Injectable } from '@nestjs/common';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { User } from '@prisma/client';

@Injectable()
export class MentorService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(userId: string) {
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma: User = await prismaTransaction.user
        .findFirstOrThrow({
          where: {
            uniqueId: userId,
          },
        })
        .catch(() => {
          throw new HttpException(`User with userId ${userId} not found`, 404);
        });
      await prismaTransaction.mentor.create({
        data: {
          userId: userPrisma.id,
        },
      });
    });
    return 'Success! new mentor has been created';
  }

  findAll() {
    return `This action returns all mentor`;
  }

  findOne(mentorId: bigint) {
    return `This action returns a #${mentorId} mentor`;
  }

  update(id: number, updateMentorDto: UpdateMentorDto) {
    return `This action updates a #${id} mentor`;
  }

  remove(id: number) {
    return `This action removes a #${id} mentor`;
  }
}
