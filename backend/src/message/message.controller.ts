import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { MessageService } from './message.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('conversation/:conversationId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 30,
  ) {
    return this.messageService.findAll(
      conversationId,
      userId,
      page,
      Math.min(limit, 100),
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
