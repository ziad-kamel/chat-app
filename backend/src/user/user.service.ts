import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import mongoose, { Model } from 'mongoose';
import { HashService } from '../common/security/hash.service.js';
import { UserRepository } from './repository/user.repository.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly hashService: HashService) { }
  create(createUserDto: CreateUserDto) {
    const hashedPassword = this.hashService.hash(createUserDto.password)
    return this.userRepository.createUser(createUserDto, hashedPassword)

  }

  findAll() {
    return this.userRepository.findAllUsers()
  }

  findOneById(id: string) {
    this.checkInvalidId(id)
    return this.userRepository.findUserById(id)
  }

  findOneByEmail(email:string){
    return this.userRepository.findUserByEmail(email)
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    this.checkInvalidId(id)
    return this.userRepository.updateUser(id, updateUserDto)
  }

  remove(id: string) {
    this.checkInvalidId(id)
    return this.userRepository.deleteUser(id)
  }

  //helper method to cheek for the id
  private checkInvalidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpException("Invalid user id", 400)
  }
}
