import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

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
  @UseGuards(AccessTokenGuard)
  postPosts(
    @Request() req: any,
    @Body('title') title: string,
    @Body('content') content: string,
    //DefaultValuePipe의 경우 new로 인스턴스화를 해줌
    //new를 사용해서 인스턴스화를 하면 함수가 실행할때마다 계속 생김
    //ParseIntPipe는 클래스를 그냥 그대로 입력해줌
    //이건 NestJs의 IOC컨테이너에서 Inversion of Control컨테이너에서 자동으로 이 값을 주입해주는 것
    //결론적으로 작동하는데는 큰 차이가 없음
    //nestJs에서 dependency injection을 해주냐 안해주냐의 차이!
    @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    const authorId = req.user.id;
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
