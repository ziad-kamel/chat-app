import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    //mandatory fields 
    @IsEmail()
    @IsNotEmpty({message: "email is reqiured"})
    email: string;
    @IsString({message:"Password is required"})
    @IsNotEmpty()
    password: string;
    
}
