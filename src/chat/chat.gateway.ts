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
import PrismaService from '../common/prisma.service';
import { Chat, ChatStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'email',
      'user-unique-id',
    ],
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  webSocketServer: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly prismaService: PrismaService,
  ) {}

  afterInit(webSocketServer: Server) {}

  async handleConnection(webSocketClient: Socket) {
    const email = webSocketClient.handshake.headers['email'] as string;
    const userUniqueId = webSocketClient.handshake.headers[
      'user-unique-id'
    ] as string;
    if (!email || !userUniqueId) {
      webSocketClient.emit('error', {
        message: 'Specified user not found',
      });
      return;
    }

    webSocketClient.emit('session', {
      sessionId: webSocketClient.handshake.headers['session-id'] as string,
      userUniqueId: webSocketClient.handshake.headers[
        'user-unique-id'
      ] as string,
    });
    webSocketClient.join(
      webSocketClient.handshake.headers['user-unique-id'] as string,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await this.prismaService.user
        .findFirstOrThrow({
          where: {
            uniqueId: webSocketClient.handshake.headers[
              'user-unique-id'
            ] as string,
          },
          select: {
            id: true,
            name: true,
          },
        })
        .catch(() => {
          webSocketClient.emit('error', {
            message: 'User not found',
          });
          throw new NotFoundException(`User not found`);
        });

      webSocketClient.handshake.headers['session-id'] = uuidv4();
      webSocketClient.handshake.headers['user'] = userUniqueId;
      webSocketClient.handshake.headers['email'] = email;

      const allMessageFromUser: Chat[] = await prismaTransaction.chat.findMany({
        where: {
          OR: [
            {
              originUserId: userPrisma.id,
            },
            {
              destinationUserId: userPrisma.id,
            },
          ],
        },
      });
      const messagesPerUser = new Map();
      for (const messageFromUser of allMessageFromUser) {
        const anotherUser =
          userPrisma.id === messageFromUser.originUserId
            ? messageFromUser.destinationUserId
            : messageFromUser.originUserId;
        if (messagesPerUser.has(anotherUser)) {
          messagesPerUser.get(anotherUser).push({
            isSender: userPrisma.id === messageFromUser.originUserId,
            message: messageFromUser.payloadMessage,
            timestamp: messageFromUser.createdAt,
            status: messageFromUser.status,
          });
        } else {
          messagesPerUser.set(anotherUser, [
            {
              isSender: userPrisma.id === messageFromUser.originUserId,
              message: messageFromUser.payloadMessage,
              timestamp: messageFromUser.createdAt,
              status: messageFromUser.status,
            },
          ]);
        }
      }

      const allRelatedUser = [];
      const allRelatedUserPrisma = await prismaTransaction.user.findMany({
        where: {
          id: {
            in: Array.from(messagesPerUser.keys()),
          },
        },
      });
      for (const relatedUserPrisma of allRelatedUserPrisma) {
        allRelatedUser.push({
          userUniqueId: relatedUserPrisma.uniqueId,
          userId: relatedUserPrisma.id,
          name: relatedUserPrisma.name,
          messages: messagesPerUser.get(BigInt(relatedUserPrisma.id)) || [],
        });
      }
      webSocketClient.emit('allRelatedUsers', allRelatedUser);
    });
  }

  async handleDisconnect(webSocketClient: Socket) {
    const matchingSockets = await webSocketClient
      .in(webSocketClient.handshake.headers['user-unique-id'] as string)
      .fetchSockets();
    const isDisconnected = matchingSockets.length === 0;
    if (isDisconnected) {
      // notify other users
      webSocketClient.broadcast.emit(
        'user disconnected',
        webSocketClient.handshake.headers['user-unique-id'] as string,
      );
      // update the connection status of the session
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoin(
    @MessageBody('name') name: string,
    @ConnectedSocket() webSocketClient: Socket,
  ): Promise<void> {}

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody('message') message: string,
    @MessageBody('destinationUserUniqueId') destinationUserUniqueId: string,
    @ConnectedSocket() webSocketClient: Socket,
  ): Promise<void> {
    // Mendapatkan pengirim di redis
    const originChatSessionTrait =
      await this.prismaService.user.findFirstOrThrow({
        where: {
          uniqueId: webSocketClient.handshake.headers[
            'user-unique-id'
          ] as string,
        },
      });
    const destinationChatSessionTrait =
      await this.prismaService.user.findFirstOrThrow({
        where: {
          uniqueId: destinationUserUniqueId,
        },
      });
    // Mendapatkan penerima di redis

    let destinationUser = null;
    let originUser = null;
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const userPrisma = await prismaTransaction.user.findMany({
        where: {
          uniqueId: {
            in: [
              originChatSessionTrait.uniqueId,
              destinationChatSessionTrait.uniqueId,
            ],
          },
        },
        select: {
          id: true,
          uniqueId: true,
          name: true,
        },
      });

      // Memisahkan origin dan destination user
      originUser = userPrisma.find(
        (user) => user.uniqueId === originChatSessionTrait.uniqueId,
      );

      destinationUser = userPrisma.find(
        (user) => user.uniqueId === destinationChatSessionTrait.uniqueId,
      );
      const chatPrisma = await prismaTransaction.chat.create({
        data: {
          originUserId: originUser.id,
          destinationUserId: destinationUser.id,
          status: ChatStatus.SENT,
          payloadMessage: message,
        },
      });
      if (originUser && destinationUser) {
        webSocketClient.nsp.to(originUser.uniqueId).emit('privateMessage', {
          originUserName: originUser.name,
          originUserUniqueId: originUser.uniqueId,
          destinationUserUniqueId: destinationUser.uniqueId,
          message: {
            isSender: true,
            message: chatPrisma.payloadMessage,
            timestamp: chatPrisma.createdAt,
            status: chatPrisma.status,
          },
        });
        webSocketClient.nsp
          .to(destinationUser.uniqueId)
          .emit('privateMessage', {
            originUserName: originUser.name,
            originUserUniqueId: originUser.uniqueId,
            destinationUserUniqueId: destinationUser.uniqueId,
            message: {
              isSender: false,
              message: chatPrisma.payloadMessage,
              timestamp: chatPrisma.createdAt,
              status: chatPrisma.status,
            },
          });
      } else {
        webSocketClient.emit('message', {
          user: 'system',
          text: `User ${destinationUser['name']} is not exists`,
        });
      }
    });
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
