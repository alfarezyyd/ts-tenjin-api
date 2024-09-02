import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';
import { ChatSessionTrait } from './trait/chat-session.trait';
import { v4 as uuidv4 } from 'uuid';
import { ChatSessionTraitBuilder } from './trait/chat-session.trait';

@Injectable()
export class ChatSessionMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}
  async use(webSocketClient: Socket, next: (err?: any) => void) {
    const sessionId = webSocketClient.handshake.auth.sessionId;
    console.log('Middleware ' + sessionId);
    if (sessionId) {
      const chatSessionTrait: ChatSessionTrait = JSON.parse(
        await this.redisService.getClient().hGet('onlineUsers', sessionId),
      );
      webSocketClient.handshake.auth.sessionId = sessionId;
      webSocketClient.handshake.auth.userUniqueId =
        chatSessionTrait.userUniqueId;
      webSocketClient.handshake.auth.name = chatSessionTrait.name;
      console.log('Chat Session Trait ' + chatSessionTrait);
      return next();
    }
    const name = webSocketClient.handshake.auth.name;
    const userUniqueId = webSocketClient.handshake.auth.name;
    if (!name || !userUniqueId) {
      return next(new NotFoundException(`Specified user not found`));
    }

    webSocketClient.handshake.auth.sessionId = uuidv4();
    webSocketClient.handshake.auth.userUniqueId = userUniqueId;
    webSocketClient.handshake.auth.name = name;
    const newChatSessionTraitBuilder = new ChatSessionTraitBuilder()
      .setSessionId(webSocketClient.handshake.auth.sessionId)
      .setUserUniqueId(userUniqueId)
      .setName(name);
    console.log('New Chat Session Trait ' + newChatSessionTraitBuilder);
    await this.redisService
      .getClient()
      .hSet(
        'onlineUsers',
        newChatSessionTraitBuilder.sessionId,
        JSON.stringify(newChatSessionTraitBuilder),
      );
    next();
  }
}
