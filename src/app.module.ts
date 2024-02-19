import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  //다른 모듈을 불러올 때 사용하는 imports
  //cli를 사용하면 자동으로 생성해줌!
  imports: [
    PostsModule,
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [PostsModel, UsersModel],
      //개발환경에서는 true
      //production한경에서는 false
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
