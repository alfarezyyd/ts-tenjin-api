import { Module } from '@nestjs/common';
import { ExpeditionService } from './expedition.service';
import { ExpeditionController } from './expedition.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ExpeditionController],
  providers: [ExpeditionService],
})
export class ExpeditionModule {}
