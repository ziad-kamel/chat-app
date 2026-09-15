import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true }) //to make add the creatAt field
export class User {

    @Prop({ required: true, trim: true })
    displayName: string;

    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true , select: false})
    password: string; //the password will be hashed before save it

    @Prop({ default: null })
    profilePictureURL: string; //path of the image after storing

    @Prop({ default: false, index: true })
    isOnline: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);