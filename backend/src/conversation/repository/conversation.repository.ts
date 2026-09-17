import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Conversation } from "../../schemas/conversation.schema.js";
import { Injectable } from "@nestjs/common";

@Injectable()
//define the main db operations CRUD
export class ConversationRepository {
    constructor(@InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>) { }

    //Create
    async create(participantIds: string[]) {
        const objectIds = participantIds.map((id) => new Types.ObjectId(id));
        const newConversation = new this.conversationModel({ participantsIds: objectIds });
        return newConversation.save();
    }

    //Read
    async findByParticipants(userId1: string, userId2: string) {
        const user1 = new Types.ObjectId(userId1);
        const user2 = new Types.ObjectId(userId2);

        return await this.conversationModel.findOne({ participantsIds: { $all: [user1, user2] } })
    }

    async findByUserId(userId: string) {
        return await this.conversationModel.find({ participantsIds: userId })
      .sort({ updatedAt: -1 }) 
      .populate({
        path: 'participantsIds',
        select: 'displayName', 
      })
      
    }
}


    