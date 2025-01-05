import { IsString, IsNotEmpty    } from 'class-validator';
import { PostsModel } from '../entity/posts.entity';
import { PickType } from '@nestjs/mapped-types';

//Pick, Omit, Partial->Type 반환
//PickType, OmitType, PartialType-> 값을 반환

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
//postsModel에서 title과 content만 상속받음
