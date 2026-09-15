import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly userService:UserService, private readonly jwtService:JwtService){}

  login(loginUserDto: LoginUserDto){
    
  }
}
