import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto)
  }
  @Public()
  @Post("signup")
  signup(@Body() createUserDto:CreateUserDto){
    return this.authService.signup(createUserDto)
  }



}
