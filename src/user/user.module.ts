import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MentorModule } from '../mentor/mentor.module';

@Module({
  imports: [CommonModule, ConfigModule, MentorModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
