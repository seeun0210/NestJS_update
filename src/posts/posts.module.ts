import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entity/posts.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModel } from  'src/users/entity/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';

import { ImageModel } from 'src/common/entity/image.entity';
import { PostImageService } from './image/image.service';

@Module({
	imports: [
		JwtModule.register({}),
		TypeOrmModule.forFeature([
			PostsModel,
			UsersModel,
			ImageModel,
		]),
		AuthModule,
		UsersModel,
		CommonModule,
	],
	//인스턴스화 해서 관래할 클래스만 그대로 클래스로 입력
	controllers: [PostsController],
	//컨트롤러에서 주입을 하는 값들을 전부 다 providers안에다 넣어줌
	//서비스 안에는 실제로 데이터를 다루는 로직을 작성
	//데이터베이스와 통신하는 typeORM, jwt같은것들도 주입해야하는 경우도 있음
	//그 클래스들도 다 providers안에다 넣어줌->의존성을 IoC 컨트롤러가 생성을해서 주입을 해줌
	providers: [
		PostsService,
		AuthService,
		UsersService,
		PostImageService,
	],
})
export class PostsModule {}
