import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
    /**
     * 1) Entity 생성
     * author -> 작성자
     * post -> 귀속되는 포스트
     * comment -> 실제 댓글 내용
     * likeCount -> 좋아요 수
     * 
     * id -> PrimaryGeneratedColumn
     * createdAt -> 생성일
     * updatedAt -> 수정일
     * 
     * 2) GET() pagination
     * 3) GET(":commentId")
     * 4) POST()
     * 5) PUT(":commentId")
     * 6) DELETE(":commentId")
      */
  }
}

