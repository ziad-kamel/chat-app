import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { Message } from "../../schemas/message.schema.js";

@Injectable()
export class MessageRepository {
    constructor(@InjectModel(Message.name) private readonly messageModel: Model<Message>) { }

    async create(conversationId: string, senderId: string, content: string) {
        const newMessage = new this.messageModel({
            conversationId: new Types.ObjectId(conversationId),
            senderId: new Types.ObjectId(senderId),
            content,
        });
        return newMessage.save();
    }

    async findByConversationId(conversationId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const filter = { conversationId: new Types.ObjectId(conversationId) };
        const [messages, total] = await Promise.all([
            this.messageModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: 'senderId', select: 'displayName profilePictureURL' }),
            this.messageModel.countDocuments(filter),
        ]);

        return {
            messages: messages.reverse(),
            page,
            limit,
            total,
            hasNextPage: skip + messages.length < total,
        };
    }

    async markAsRead(conversationId: string, userId: string) {
        return this.messageModel.updateMany(
            {
                conversationId: new Types.ObjectId(conversationId),
                senderId: { $ne: new Types.ObjectId(userId) },
                readAt: null,
            },
            { readAt: new Date() },
        );
    }
}
