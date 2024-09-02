import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';

@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  webSocketServer: Server;

  private clients = new Map<string, string>(); // Mapping socket.id ke username

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  afterInit(webSocketServer: Server) {}

  async handleConnection(webSocketClient: Socket) {
    webSocketClient.emit('session', {
      sessionId: webSocketClient.handshake.auth.sessionId,
      userUniqueId: webSocketClient.handshake.auth.userUniqueId,
    });
  }

  async handleDisconnect(webSocketClient: Socket) {
    const matchingSockets = await webSocketClient
      .in(webSocketClient.handshake.auth.sessionId)
      .fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
      // notify other users
      webSocketClient.broadcast.emit(
        'user disconnected',
        webSocketClient.handshake.auth.userUniqueId,
      );
      // update the connection status of the session
      await this.redisService
        .getClient()
        .hDel('onlineUsers', webSocketClient.handshake.auth.sessionId);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoin(
    @MessageBody('name') name: string,
    @ConnectedSocket() webSocketClient: Socket,
  ): Promise<void> {
    await this.redisService
      .getClient()
      .hSet('onlineUsers', name, webSocketClient.id);

    webSocketClient.broadcast.emit('channelMessage', {
      user: 'server',
      text: `${name} has joined the chat`,
    });

    const onlineUsers = await this.redisService
      .getClient()
      .hGetAll('onlineUsers');
    webSocketClient.emit('users', onlineUsers);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody('message') message: string,
    @MessageBody('destinationUser') destinationUser: string,
    @ConnectedSocket() webSocketClient: Socket,
  ): Promise<void> {
    const originUser = await this.redisService
      .getClient()
      .hGet('onlineUsers', webSocketClient.handshake.auth.name);
    const destinationClientId = await this.redisService
      .getClient()
      .hGet('onlineUsers', destinationUser);

    if (destinationClientId) {
      webSocketClient
        .to(destinationClientId)
        .emit('privateMessage', { from: originUser, text: message });
    } else {
      webSocketClient.emit('message', {
        user: 'system',
        text: `User ${destinationUser} is not online`,
      });
    }
  }

  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}
