import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { MessageService } from './message.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { GetMessagesDto } from './dto/get-messages.dto.js';

@Controller('conversation/:conversationId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query() getMessagesDto: GetMessagesDto,
  ) {
    return this.messageService.findAll(
      conversationId,
      userId,
      getMessagesDto.page,
      getMessagesDto.limit,
    );
  }

  @Post('read')
  markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
  ) {
    return this.messageService.markAsRead(conversationId, userId);
  }
}
