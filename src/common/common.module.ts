import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { TEMP_FOLDER_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports:[
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
              cb(null, TEMP_FOLDER_PATH);
            },
            filename: function (req, file, cb) {
              //123123-123123-123123-123123.jpg
              cb(null, `${uuid()}${extname(file.originalname)}`);
            },
          }),
        }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports:[CommonService]
})
export class CommonModule {}

