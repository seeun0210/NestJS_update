import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}
let posts: PostModel[] = [
  {
    id: 1,
    author: '투어스_official',
    title: '부끄러워하는 신유',
    content: '볼하트를 실패한 신유',
    likeCount: 100000,
    commentCount: 100000,
  },
  {
    id: 2,
    author: '투어스_official',
    title: '부끄러워하는 신유',
    content: '노래하는 신유',
    likeCount: 100000,
    commentCount: 100000,
  },
  {
    id: 3,
    author: '투어스_official',
    title: '부끄러워하는 신유',
    content: '춤추는 신유',
    likeCount: 100000,
    commentCount: 100000,
  },
];
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 post를 다 가져온다
  @Get()
  getPosts() {
    return posts;
  }

  // 2) GET /posts/:id
  // id에 해당되는 post를 가져온다
  @Get(':id')
  getPost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === +id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
  // 3)POST /posts
  // post를 생성한다
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];
    return posts;
  }
}
