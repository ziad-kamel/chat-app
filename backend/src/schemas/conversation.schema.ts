import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Conversation {

    @Prop({ required: true, index: true, type: [{ type: Types.ObjectId, ref: 'User' }] })
    participantsIds: Types.ObjectId[]; //store the ids of the 2 users being chating in this conversation (M:M)

    @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
    lastMessageId: Types.ObjectId;

}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)