import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    //mandatory fields 
    @IsString({message:"Username is required"})
    @IsNotEmpty()
    displayName: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString({message:"Password is required"})
    @IsNotEmpty()
    password: string;
    //optional fields
    @IsString()
    @IsOptional()
    profilePictureURL?:string;
    @IsOptional()
    @IsBoolean()
    isOnline?:boolean
    
}
