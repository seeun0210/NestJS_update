import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string,
  //   @Body('password') password: string,
  //   @Body('email') email: string,
  // ) {
  //   return this.usersService.createUser({ nickname, email, password });
  // }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  //인터셉터를 사용해서 @Exclude()어노테이션을 붙인 값을 제거할 수 있다
  /**
   * serialization-> 직렬화-> 현재 시스템에서 사용되는 (NESTJS) 데이터의 구조를 다른 시스템에도 쉽게 사용할 수 있는 포맷으로 변환
   * -> class의 object에서 JSON 포맷으로 변환
   */
  /**
   * ClassSerializerInterceptor:즉, 인스턴스 형태로 반환되는 값이 JSON으로 자동으로 바뀔 때 직렬화 해주는 interceptor다
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
