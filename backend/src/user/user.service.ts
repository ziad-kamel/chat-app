import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema.js';
import mongoose, { Model } from 'mongoose';
import { HashService } from '../common/security/hash.service.js';

@Injectable()
export class UserService {
  constructor (@InjectModel(User.name) private readonly userModel: Model<User>, private  readonly hashService: HashService){}
  create(createUserDto: CreateUserDto) {
    //creating doucument object from the User collection
    //save the user and return the user document back to the controller 
    //TODO: add the password hashing logic before saving to db desk
    const hashedPassword = this.hashService.hash(createUserDto.password)
    const newUser = new this.userModel({...createUserDto , password:hashedPassword});
    return newUser.save();
  }

  findAll() {
    const allUsers = this.userModel.find();
    return allUsers
  }

   async findOneById(id: string) {
    this.checkInvalidId(id)
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

   update(id: string, updateUserDto: UpdateUserDto) {
    this.checkInvalidId(id)
      return this.userModel.findByIdAndUpdate(id, updateUserDto, {returnDocument:"after"})
  }

  remove(id: string) {
    this.checkInvalidId(id)
    return this.userModel.findByIdAndDelete(id)
  }

  //helper method to cheek for the id
  checkInvalidId(id:string){
    if(! mongoose.Types.ObjectId.isValid(id)) throw new HttpException("Invalid user id",400)
  }
}
