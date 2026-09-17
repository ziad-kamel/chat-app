import { IsBoolean, IsMongoId } from "class-validator";

export class TypingMessageDto {
    @IsMongoId()
    conversationId: string

    @IsBoolean()
    isTyping: boolean
}
