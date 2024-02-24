import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';
import { LogMiddleWare } from 'src/common/middleware/log.middleware';
import { Get } from '@nestjs/common';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([PostsModel, UsersModel]),
    AuthModule,
    UsersModel,
    CommonModule,
    MulterModule.register({
      limits: {
        //바이트단위로 입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(에러,boolean)
         *
         * 첫번째 파라미터에는 에러가 있을 경우 정보를 넣어준다
         * 두번재 파라미터에는 파일을 받을지 말지 boolean을 넣어준다
         */
        //xxx.jpg->.jpg
        const ext = extname(file.originalname);
        if (ext !== '.JPG' && ext !== 'jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg/jpeg/png파일만 업로드 가능합니다!'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          //123123-123123-123123-123123.jpg
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  //인스턴스화 해서 관래할 클래스만 그대로 클래스로 입력
  controllers: [PostsController],
  //컨트롤러에서 주입을 하는 값들을 전부 다 providers안에다 넣어줌
  //서비스 안에는 실제로 데이터를 다루는 로직을 작성
  //데이터베이스와 통신하는 typeORM, jwt같은것들도 주입해야하는 경우도 있음
  //그 클래스들도 다 providers안에다 넣어줌->의존성을 IoC 컨트롤러가 생성을해서 주입을 해줌
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
