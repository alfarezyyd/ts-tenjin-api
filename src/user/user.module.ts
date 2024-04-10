import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CommonModule, CartModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
