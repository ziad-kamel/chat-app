import {  Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { HashService } from '../common/security/hash.service.js';
import { UserRepository } from './repository/user.repository.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly hashService: HashService) { }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashService.hash(createUserDto.password)
    return this.userRepository.createUser(createUserDto, hashedPassword)

  }

  findAll() {
    return this.userRepository.findAllUsers()
  }

  findOneById(id: string) {
    const user = this.userRepository.findUserById(id)
    if (!user) { throw new NotFoundException() }
    return user
  }

  findOneByEmail(email: string) {
    const user = this.userRepository.findUserByEmail(email)
    if (!user) { throw new NotFoundException() }
    return user
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.userRepository.updateUser(id, updateUserDto)
    if (!user) { throw new NotFoundException() }
    return user
  }

  remove(id: string) {
    return this.userRepository.deleteUser(id)
  }

}
