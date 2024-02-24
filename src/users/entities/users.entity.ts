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
import { IsEmail, IsString, Length } from 'class-validator';
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
  @IsString()
  @Length(1, 20, { message: '닉네임은 1~20자 사이로 입력해주세요.' })
  //1) 길이가 20을 넘지 않을 것
  //2) 유일무이한 값이 될 것
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  //1) 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString()
  @Length(3, 8, { message: '비밀전호는 3~8자 사이로 입력해주세요' })
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
