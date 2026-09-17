import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { ConversationService } from '../conversation/conversation.service.js';
import { MessageRepository } from './repository/message.repository.js';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationService: ConversationService,
  ) { }

  async create(conversationId: string, senderId: string, createMessageDto: CreateMessageDto) {
    if (!createMessageDto.content?.trim() || createMessageDto.content.length > 5000) {
      throw new BadRequestException('Message content is invalid');
    }
    await this.findConversationForUser(conversationId, senderId);
    return this.messageRepository.create(conversationId, senderId, createMessageDto.content);
  }

  async findAll(conversationId: string, userId: string, page: number, limit: number) {
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Pagination values are invalid');
    }
    await this.findConversationForUser(conversationId, userId);
    return this.messageRepository.findByConversationId(conversationId, page, limit);
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.findConversationForUser(conversationId, userId);
    return this.messageRepository.markAsRead(conversationId, userId);
  }

  async findConversationForUser(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Conversation id is invalid');
    }
    const conversation = await this.conversationService.findOneById(conversationId);
    const isParticipant = conversation.participantsIds.some(
      (participantId) => participantId.toString() === userId.toString(),
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    return conversation;
  }
}
