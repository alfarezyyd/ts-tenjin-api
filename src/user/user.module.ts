import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ValidationService } from '../common/validation.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ValidationService],
})
export class UserModule {}
