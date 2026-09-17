import { IsMongoId } from "class-validator";

export class ReadMessageDto {
    @IsMongoId()
    conversationId: string
}
