import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],

  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
