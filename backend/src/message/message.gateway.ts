import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { ConversationService } from '../conversation/conversation.service.js';

@WebSocketGateway({ cors: true })
export class MessageGateway {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) { }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token
      ?? socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        { secret: this.configService.getOrThrow<string>('JWT_SECRET') },
      );
      socket.data.userId = payload.sub;
      socket.join(`user:${payload.sub}`);
      this.server.emit('user:online', { userId: payload.sub });
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    if (socket.data.userId) {
      this.server.emit('user:offline', { userId: socket.data.userId });
    }
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: CreateMessageDto & { conversationId: string },
  ) {
    const message = await this.messageService.create(
      body.conversationId,
      socket.data.userId,
      body,
    );
    const conversation = await this.messageService.findConversationForUser(
      body.conversationId,
      socket.data.userId,
    );
    await Promise.all([
      this.conversationService.markLastMessage(
        body.conversationId,
        message._id.toString(),
      ),
      ...conversation.participantsIds.map((participantId) =>
        Promise.resolve(
          this.server.to(`user:${participantId.toString()}`).emit('message:new', message),
        ),
      ),
    ]);
    return message;
  }

  @SubscribeMessage('conversation:typing')
  async typing(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string; isTyping: boolean },
  ) {
    const conversation = await this.messageService.findConversationForUser(
      body.conversationId,
      socket.data.userId,
    );
    for (const participantId of conversation.participantsIds) {
      if (participantId.toString() !== socket.data.userId) {
        this.server.to(`user:${participantId.toString()}`).emit('conversation:typing', {
          conversationId: body.conversationId,
          userId: socket.data.userId,
          isTyping: body.isTyping,
        });
      }
    }
  }

  @SubscribeMessage('conversation:read')
  async read(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    await this.messageService.markAsRead(body.conversationId, socket.data.userId);
    const conversation = await this.messageService.findConversationForUser(
      body.conversationId,
      socket.data.userId,
    );
    for (const participantId of conversation.participantsIds) {
      this.server.to(`user:${participantId.toString()}`).emit('conversation:read', {
        conversationId: body.conversationId,
        userId: socket.data.userId,
      });
    }
  }
}
