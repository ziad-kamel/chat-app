import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Post()
  create(@CurrentUser('userId') currentUserId: string,@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.createConversation(currentUserId,createConversationDto.recipientId);
  }

  @Get()
  async findAll(@CurrentUser('userId') currentUserId: string) {    
    return await this.conversationService.findAllUserConversations(currentUserId);
  }

  @Get(':recipientId')
  async findOne(@CurrentUser('userId',ParseObjectIdPipe) currentUserId: string,@Param('recipientId', ParseObjectIdPipe) recipientId: string) {    
    return this.conversationService.findByParticipants(
      currentUserId,
      recipientId,
    );
  }
}
