import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './repository/conversation.repository.js';
import { UserService } from '../user/user.service.js';

@Injectable()
export class ConversationService {
  constructor(private readonly conversationRepository: ConversationRepository, private readonly userService: UserService) { }

  async createConversation(currentUserId: string, recipientId: string) {

    if (currentUserId === recipientId) {
      throw new BadRequestException('You cannot start a conversation with yourself');
    }

    await this.userService.findOneById(recipientId);

    const existing = await this.findByParticipants(currentUserId, recipientId)
    if (existing) {
      return existing
    }
    const newConversation = await this.conversationRepository.create([currentUserId, recipientId]);
    return newConversation
  }

  async findByParticipants(userId1: string, userId2: string) {
    if (userId1.toString() === userId2.toString()) { throw new BadRequestException("Can't search for yourself") }
    return this.conversationRepository.findByParticipants(userId1, userId2);
  }

  async findOneById(id: string) {
    const conversation = await this.conversationRepository.findOneById(id);
    if (!conversation) {
      throw new NotFoundException();
    }
    return conversation;
  }

  async markLastMessage(conversationId: string, messageId: string) {
    const conversation = await this.conversationRepository.findOneById(conversationId);
    if (!conversation) {
      throw new NotFoundException();
    }
    return this.conversationRepository.updateLastMessage(conversationId, messageId);
  }

  async findAllUserConversations(userId: string) {
    return await this.conversationRepository.findByUserId(userId);
  }
}
