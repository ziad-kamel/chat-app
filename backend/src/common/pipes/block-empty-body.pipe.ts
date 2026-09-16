import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class BlockEmptyBodyPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type === "body") {
            if (!value || Object.keys(value).length === 0) {
                throw new BadRequestException("Request body can't be empty")
            }
        }
        return value
    }
}