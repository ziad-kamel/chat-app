import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll() {
    return await this.userRepository.findAllUsers()
  }

  async findOneById(id: string) {
    const user = await this.userRepository.findUserById(id)
    if (!user) { throw new NotFoundException() }
    return user
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email)
    if (!user) { throw new NotFoundException() }
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.updateUser(id, updateUserDto)
    if (!user) { throw new NotFoundException() }
    return user
  }

  async remove(id: string) {
    const deletedUser = await this.userRepository.deleteUser(id)
    if (!deletedUser) { throw new NotFoundException() }
    return deletedUser
  }

}
