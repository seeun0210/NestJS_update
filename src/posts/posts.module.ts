import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  //인스턴스화 해서 관래할 클래스만 그대로 클래스로 입력
  controllers: [PostsController],
  //컨트롤러에서 주입을 하는 값들을 전부 다 providers안에다 넣어줌
  //서비스 안에는 실제로 데이터를 다루는 로직을 작성
  //데이터베이스와 통신하는 typeORM, jwt같은것들도 주입해야하는 경우도 있음
  //그 클래스들도 다 providers안에다 넣어줌->의존성을 IoC 컨트롤러가 생성을해서 주입을 해줌
  providers: [PostsService],
})
export class PostsModule {}
