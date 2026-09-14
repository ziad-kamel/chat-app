import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Message {

    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
    conversationId: Types.ObjectId //reference the conversation table to do the (1:M)

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId //reference the User table to do the (1:M)

    @Prop({ required: true, trim: true })
    content: string

    @Prop({ default: null })
    readAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
MessageSchema.index({ conversationId: 1, createdAt: -1 }); //index for future chat history pagination