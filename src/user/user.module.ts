import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
