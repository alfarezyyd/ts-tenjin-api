import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import ValidationService from '../common/validation.service';
import PrismaService from '../common/prisma.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
