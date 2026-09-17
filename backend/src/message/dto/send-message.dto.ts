import { IsMongoId } from "class-validator";
import { CreateMessageDto } from "./create-message.dto.js";

export class SendMessageDto extends CreateMessageDto {
    @IsMongoId()
    conversationId: string
}
