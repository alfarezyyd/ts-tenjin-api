import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [CommonModule, UserModule, AddressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
