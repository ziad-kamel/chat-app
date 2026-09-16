import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema.js';
import { SecurityModule } from '../common/security/security.module.js';
import { UserRepository } from './repository/user.repository.js';

@Module({
  imports:[
    MongooseModule.forFeature([{name: User.name, schema:UserSchema},]),
    SecurityModule
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports:[UserService]
})
export class UserModule {}
