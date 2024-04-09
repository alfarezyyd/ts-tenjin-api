import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CommonModule } from '../common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, MulterModule, ConfigModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
