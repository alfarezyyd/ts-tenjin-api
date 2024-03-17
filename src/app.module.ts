import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ValidationService } from './common/validation.service';

@Module({
  imports: [CommonModule],
  controllers: [AppController],
  providers: [AppService, ValidationService],
})
export class AppModule {}
