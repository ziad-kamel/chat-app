import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    //mandatory fields 
    @IsEmail()
    @IsNotEmpty({message: "email is reqiured"})
    email: string;
    @IsString({message:"Password is required"})
    @IsNotEmpty()
    password: string;
    
}
