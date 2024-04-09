import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CommonModule } from '../common/common.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [CommonModule, MulterModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
