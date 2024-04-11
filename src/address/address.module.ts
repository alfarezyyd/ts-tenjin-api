import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import ValidationService from '../common/validation.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [AddressController],
  providers: [AddressService, ValidationService],
})
export class AddressModule {}
