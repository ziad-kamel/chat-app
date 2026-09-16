import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { HashService } from '../common/security/hash.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService
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

  async isAuthed(authHeader: string) {
    //check if there is a header sent
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }
    //get the token from the header
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid token format. Expected: Bearer <token>');
    }
    const token = parts[1];
    //check for token validation
    const isValid = await this.jwtService.verifyAsync(token).then((response) => { return response }).catch(() => { throw new UnauthorizedException() })
    return isValid
  }

  async signup(createUserDto: CreateUserDto) {
    //create and save user
    //return the token in order to store it to client-side
    const newUser = await this.userService.create(createUserDto)
    return {
      message: "User Created Succesfuly",
      token: await this.createToken(newUser._id.toString())
    }
  }



  private async createToken(userId: string) {
    const payload = { id: userId };
    return { accessToken: await this.jwtService.signAsync(payload) }

  }
}
