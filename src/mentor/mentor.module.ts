import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CommonModule, JwtModule],
  controllers: [MentorController],
  providers: [MentorService],
})
export class MentorModule {}
