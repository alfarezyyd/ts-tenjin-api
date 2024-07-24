import { Module } from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { AssistanceController } from './assistance.controller';

@Module({
  controllers: [AssistanceController],
  providers: [AssistanceService],
})
export class AssistanceModule {}
