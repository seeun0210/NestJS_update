import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  getPost(): Post {
    return {
      author: '투어스_official',
      title: '부끄러워하는 신유',
      content: '볼하트를 실패한 신유',
      likeCount: 100000,
      commentCount: 100000,
    };
  }
}
