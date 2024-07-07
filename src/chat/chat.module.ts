import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
