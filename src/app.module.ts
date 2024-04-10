import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { ExpeditionModule } from './expedition/expedition.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AddressModule,
    ProductModule,
    StoreModule,
    ExpeditionModule,
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
