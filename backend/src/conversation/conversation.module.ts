import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service.js';
import { ConversationController } from './conversation.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema.js';
import { Message, MessageSchema } from '../schemas/message.schema.js';
import { ConversationRepository } from './repository/conversation.repository.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService, ConversationRepository],
})
export class ConversationModule {}
