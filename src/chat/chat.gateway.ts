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
import PrismaService from '../common/prisma.service';
import {
  ChatSessionTrait,
  ChatSessionTraitBuilder,
} from './trait/chat-session.trait';
import { Chat, ChatStatus } from '@prisma/client';

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
    private readonly prismaService: PrismaService,
  ) {}

  afterInit(webSocketServer: Server) {}

  async handleConnection(webSocketClient: Socket) {
    webSocketClient.emit('session', {
      sessionId: webSocketClient.handshake.auth.sessionId,
      userUniqueId: webSocketClient.handshake.auth.userUniqueId,
    });
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user.findFirstOrThrow({
        where: {
          uniqueId: webSocketClient.handshake.auth.userUniqueId,
        },
        select: {
          id: true,
        },
      });
      const allMessageFromUser: Chat[] = await prismaTransaction.chat.findMany({
        where: {
          originUserId: userPrisma.id,
        },
      });
      const messagesPerUser = new Map();
      for (const messageFromUser of allMessageFromUser) {
        const anotherUser =
          userPrisma.id === messageFromUser.id
            ? messageFromUser.id
            : userPrisma;
        if (messagesPerUser.has(anotherUser)) {
          messagesPerUser.get(anotherUser).push(messageFromUser.payloadMessage);
        } else {
          messagesPerUser.set(anotherUser, [messageFromUser.payloadMessage]);
        }
      }
      const allOnlineUsers = [];
      const allOnlineUsersFromRedis = await this.redisService
        .getClient()
        .hGetAll('onlineUsers');

      // Melakukan loop terhadap semua user online
      for (const [sessionId, chatPayload] of Object.entries(
        allOnlineUsersFromRedis,
      )) {
        const parsedChatPayload = JSON.parse(chatPayload);
        allOnlineUsers.push({
          sessionId: sessionId,
          userId: parsedChatPayload.userId,
          name: parsedChatPayload.name,
          messages: messagesPerUser.get(parsedChatPayload.userId) || [],
        });
      }
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
    @MessageBody('destinationUser') destinationSessionId: string,
    @ConnectedSocket() webSocketClient: Socket,
  ): Promise<void> {
    const originChatSessionTrait: ChatSessionTrait = JSON.parse(
      await this.redisService
        .getClient()
        .hGet('onlineUsers', webSocketClient.handshake.auth.sessionId),
    );
    const destinationChatSessionTrait: ChatSessionTrait = JSON.parse(
      await this.redisService
        .getClient()
        .hGet('onlineUsers', destinationSessionId),
    );
    let destinationUser = null;
    let originUser = null;
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user.findMany({
        where: {
          uniqueId: {
            in: [
              originChatSessionTrait.userUniqueId,
              destinationChatSessionTrait.userUniqueId,
            ],
          },
        },
        select: {
          id: true,
          uniqueId: true,
        },
      });
      originUser = userPrisma.find(
        (user) => user.uniqueId === originChatSessionTrait.userUniqueId,
      );

      destinationUser = userPrisma.find(
        (user) => user.uniqueId === destinationChatSessionTrait.userUniqueId,
      );
      prismaTransaction.chat.create({
        data: {
          originUserId: originUser.id,
          destinationUserId: destinationUser.id,
          status: ChatStatus.SENT,
          payloadMessage: message,
        },
      });
    });
    if (originUser || destinationUser) {
      webSocketClient
        .to(destinationUser.uniqueId)
        .to(originUser.uniqueId)
        .emit('privateMessage', { from: originUser.id, text: message });
    } else {
      webSocketClient.emit('message', {
        user: 'system',
        text: `User ${destinationSessionId} is not online`,
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
