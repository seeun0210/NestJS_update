import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
interface Post {
  author: string;
  title: string;
  comment: string;
  likeCount: number;
  commentCount: number;
}
@Controller('post')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getPost(): Post {
    return {
      author: '투어스_official',
      title: '투어스_신유',
      comment: '부끄운 신유',
      likeCount: 10000000,
      commentCount: 10000000,
    };
  }
}
