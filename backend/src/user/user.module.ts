import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema.js';
import { SecurityModule } from '../common/security/security.module.js';

@Module({
  imports:[
    MongooseModule.forFeature([{name: User.name, schema:UserSchema},]),
    SecurityModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
