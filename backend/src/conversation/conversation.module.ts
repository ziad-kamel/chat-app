import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service.js';
import { ConversationController } from './conversation.controller.js';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
