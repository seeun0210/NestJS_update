import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 post를 다 가져온다
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // id에 해당되는 post를 가져온다
  // 그런데 파라미터는 무조건 string이다(url에서 추출해오기 때문)
  // 그래서 pipe라는걸 쓴다
  // ParseIntPipe: 숫자로 바꾸고 검증까지 해준다
  // 만약에 숫자로 바꿀 수 없는 "adsfa"같은 값이 들어오면
  // {
  //     "message": "Validation failed (numeric string is expected)",
  //     "error": "Bad Request",
  //     "statusCode": 400
  // }
  //이런 에러가 뜬다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    //param으로 받으면 string으로 넘어옴
    //+를 붙여주면 number 가 됨
    return this.postsService.getPostById(id);
  }
  // 3)POST /posts
  // post를 생성한다
  @Post()
  postPosts(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(authorId, title, content);
  }
  // 4)PUT /posts/:id
  // id에 해당하는 POST를 변경한다.
  @Put(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }
  // 5) DELETE /posts/:id
  // id에 해당되는 POST를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(+id);
  }
}
