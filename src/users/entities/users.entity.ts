import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude } from 'class-transformer';
/**
 * id: number
 *
 * nickname: string
 *
 * email: string
 *
 * password: string
 *
 * role: [RolesEnum.USER, RolesEnum.ADMIN]
 *
 *
 */
@Entity()
export class UsersModel extends BaseModel {
  // @PrimaryGeneratedColumn()
  // id: number;

  @Column({
    //1) 길이
    length: 20,
    //2) 유일무이한 값
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  //1) 길이가 20을 넘지 않을 것
  //2) 유일무이한 값이 될 것
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail({}, { message: emailValidationMessage })
  //1) 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(3, 8, { message: lengthValidationMessage })
  /**
   * Request
   * frontend->backend
   * plain object(JSON)->class instance (dto)
   *
   * Response
   * backend->fronted
   * class instance(dto)->plain object(JSON)
   *
   * toClassOnly->class instance 변환될때만
   * toPlainOnly->plain object 변환될때만
   */
  /**
   * 우리는 응답에서만 제외시켜야 함
   */
  //toPlainOnly:true-> 응답이 나갈때만 제외를 시킴
  @Exclude({
    toPlainOnly: true,
  })
  //class-transformer로 부터 불러옴
  //비밀번호를 불러오기를 원하지 않는 곳에서 interceptor로 비밀번호를 제거할 수 있음
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  // @UpdateDateColumn()
  // updatedAt: Date;

  // @CreateDateColumn()
  // createdAt: Date;
}
