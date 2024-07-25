import { Module } from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { AssistanceController } from './assistance.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [AssistanceController],
  providers: [AssistanceService],
  exports: [AssistanceService],
})
export class AssistanceModule {}
