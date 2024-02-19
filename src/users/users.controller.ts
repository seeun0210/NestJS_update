import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  postUser(
    @Body('nickname') nickname: string,
    @Body('password') password: string,
    @Body('email') email: string,
  ) {
    return this.usersService.createUser({ nickname, email, password });
  }

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
