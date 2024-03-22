import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AddressModule,
    ProductModule,
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
