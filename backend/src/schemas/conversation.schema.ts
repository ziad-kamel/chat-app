import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Conversation {

    @Prop({
        required: true,
        index: true,
        type: [{ type: Types.ObjectId, ref: 'User' }],
        validate: [
            (val: Types.ObjectId[]) => val.length === 2,
            'A 1-on-1 conversation must have exactly 2 participants',
        ],
    })
    participantsIds: Types.ObjectId[]; //store the ids of the 2 users being chating in this conversation (M:M)

    @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
    lastMessageId: Types.ObjectId;

}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)