import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsString({message:"Username is required"})
    @IsNotEmpty()
    displayName: string;
    @IsString({message:"Handler is required"})
    @IsNotEmpty()
    handler: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString({message:"Password is required"})
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    profilePictureURL?:string;
    @IsOptional()
    @IsBoolean()
    isOnline?:boolean
    
}
