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
import { RedisClientType } from 'redis';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis.service';

@WebSocketGateway({
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
  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleConnection(client: Socket, ...args: any[]) {}

  async handleDisconnect(client: Socket) {
    await this.redisService.getClient().hDel('onlineUsers', client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody('username') username: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.redisService
      .getClient()
      .hSet('onlineUsers', client.id, username);
    client.broadcast.emit('message', {
      user: 'system',
      text: `${username} has joined the chat`,
    });
    const onlineUsers = await this.redisService
      .getClient()
      .hGetAll('onlineUsers');
    client.emit('users', onlineUsers);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('message') message: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const username = await this.redisService
      .getClient()
      .hGet('onlineUsers', client.id);
    this.webSocketServer.emit('message', { user: username, text: message });
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
