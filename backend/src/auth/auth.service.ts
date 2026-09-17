import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { HashService } from '../common/security/hash.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { TokenBlacklistService } from './services/token-blacklist.service.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) { }

  async login(loginDto: LoginDto) {
    //check if there is a user with the provided email
    const user = await this.userService.findOneByEmail(loginDto.email)
    if (!user) { throw new UnauthorizedException("Invalid credentials") }


    //then check for the password match
    const isValidPassword = await this.hashService.compare(loginDto.password, user.password)

    if (!isValidPassword) { throw new UnauthorizedException("Invalid credentials") }

    //then generate the token to send back the payload with auth token
    return await this.createToken(user._id.toString())
  }

  async signup(createUserDto: CreateUserDto) {
    //first make sure there is no user with the same email
    const existingUser = await this.userService.findOneByEmail(createUserDto.email)
    if(existingUser){throw new ConflictException("Email provided is already in use")}
    
    //create and save user
    //return the token in order to store it to client-side
    const newUser = await this.userService.create(createUserDto)
    return {
      message: "User Created Succesfuly",
      token: await this.createToken(newUser._id.toString())
    }
  }

  async logout(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const payload = await this.jwtService.verifyAsync<{ jti?: string; exp?: number }>(token);
    if (!payload.jti || !payload.exp) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    this.tokenBlacklistService.revoke(payload.jti, payload.exp);
    return { message: 'Logged out successfully' };
  }



  private async createToken(userId: string) {
    const payload = { sub: userId };
    const jti = randomUUID();
    return { accessToken: await this.jwtService.signAsync(payload, { jwtid: jti }) }

  }
}
