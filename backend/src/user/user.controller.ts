import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { BlockEmptyBodyPipe } from '../common/pipes/block-empty-body.pipe.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }


  @Get(':id')
  findOneById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body(new BlockEmptyBodyPipe) updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseObjectIdPipe) id: string) {
    return this.userService.remove(id);
  }
}
