import { InjectModel } from "@nestjs/mongoose";
import { User } from "../entities/user.entity.js";
import { Model } from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto.js";
import { NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "../dto/update-user.dto.js";

//define the main db operations CRUD
export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    //Create
    async createUser(createUserDto: CreateUserDto, hashedPassword: string) {
        const newUser = new this.userModel({ ...createUserDto, password: hashedPassword });
        return await newUser.save();
    }

    //Read
    async findAllUsers() {
        return await this.userModel.find();
    }
    async findUserById(id: string) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException()
        }
        return user
    }

    //Update
    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        return await this.userModel.findByIdAndUpdate(id, updateUserDto, { returnDocument: "after" })
    }

    //Delete
    async deleteUser(id: string) {
        return await this.userModel.findByIdAndDelete(id)
    }
}