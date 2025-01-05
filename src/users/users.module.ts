import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])],
  //exports해줘야 다른 모듈에서 사용이 가능하다.
  //다른 모듈에서 usersModule을 불러오는 것 만으로는 UsersService사용이 불가
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
