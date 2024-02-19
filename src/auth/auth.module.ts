import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  //providers 안의 값들은 해당 모듈안에서만 쓸 수 있다
  //그래서 이 모듈을 다른 곳에서 임포트했을 때 사용할 수 있게 하려면 export를 해줘야한다.
  providers: [AuthService],
})
export class AuthModule {}
