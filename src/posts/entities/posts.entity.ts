import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  // @PrimaryGeneratedColumn()
  // id: number;

  //1) UsersModel과 연동한다 foreign key를 이용해서
  //2) null이 될 수 없다.
  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column({
    nullable: true,
  })
  image?: string;

  @Column()
  commentCount: number;

  //UsersModel에서도 있는 컬럼이 지금 중복되고 있는 중임
  //OOP를 사용해서 묶어보자
  // @UpdateDateColumn()
  // updatedAt: Date;

  // @CreateDateColumn()
  // createdAt: Date;
}
