import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schemas/message.schema.js';
import { ConversationModule } from '../conversation/conversation.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MessageService } from './message.service.js';
import { MessageController } from './message.controller.js';
import { MessageRepository } from './repository/message.repository.js';
import { MessageGateway } from './message.gateway.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ConversationModule,
    AuthModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageGateway],
})
export class MessageModule { }
