import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Conversation } from "../../schemas/conversation.schema.js";
import { Injectable } from "@nestjs/common";
import { Message } from "../../schemas/message.schema.js";

@Injectable()
export class ConversationRepository {
    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    ) { }

    async create(participantIds: string[]) {
        const objectIds = participantIds.map((id) => new Types.ObjectId(id));
        const newConversation = new this.conversationModel({ participantsIds: objectIds });
        return newConversation.save();
    }

    async findOneById(id: string) {
        return await this.conversationModel.findById(id)
    }

    async findByParticipants(userId1: string, userId2: string) {
        const user1 = new Types.ObjectId(userId1);
        const user2 = new Types.ObjectId(userId2);

        return await this.conversationModel.findOne({
            participantsIds: { $all: [user1, user2], $size: 2 },
        }).sort({ createdAt: 1 })
    }

    async findByUserId(userId: string) {
        const conversations = await this.conversationModel.find({ participantsIds: userId })
            .sort({ createdAt: 1 })
            .populate({
                path: 'participantsIds',
                select: 'displayName profilePictureURL isOnline',
            })
            .populate({
                path: 'lastMessageId',
                select: 'content senderId createdAt readAt',
            })
        return Promise.all(conversations.map(async (conversation) => ({
            ...conversation.toObject(),
            unreadCount: await this.messageModel.countDocuments({
                conversationId: conversation._id,
                senderId: { $ne: new Types.ObjectId(userId) },
                readAt: null,
            }),
        })))
    }

    async updateLastMessage(conversationId: string, messageId: string) {
        return await this.conversationModel.findByIdAndUpdate(
            conversationId,
            { lastMessageId: new Types.ObjectId(messageId) },
            { returnDocument: 'after' }
        )
    }
}
