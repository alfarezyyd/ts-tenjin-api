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

  afterInit(server: Server) {}

  async handleConnection(client: Socket) {}

  async handleDisconnect(client: Socket) {
    const username = this.clients.get(client.id);
    if (username) {
      this.clients.delete(client.id);
      await this.redisService.getClient().hDel('onlineUsers', username);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody('username') username: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.clients.set(client.id, username);
    await this.redisService
      .getClient()
      .hSet('onlineUsers', username, client.id);

    client.broadcast.emit('message', {
      user: 'system',
      text: `${username} has joined the chat`,
    });

    const onlineUsers = await this.redisService
      .getClient()
      .hGetAll('onlineUsers');
    client.emit('users', onlineUsers);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody('message') message: string,
    @MessageBody('toUser') toUser: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const fromUser = this.clients.get(client.id);
    const toClientId = await this.redisService
      .getClient()
      .hGet('onlineUsers', toUser);

    if (toClientId) {
      client
        .to(toClientId)
        .emit('privateMessage', { from: fromUser, text: message });
    } else {
      client.emit('message', {
        user: 'system',
        text: `User ${toUser} is not online`,
      });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody('message') message: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const username = this.clients.get(client.id);
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
