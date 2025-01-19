import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagenate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';

@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly dataSource: DataSource,
	) {}

	// 1) GET /posts
	// 모든 post를 다 가져온다
	@Get()
	getPosts(@Query() query: PaginatePostDto) {
		return this.postsService.paginatePosts(query);
	}

	// POST /posts/random
	@Post('random')
	@UseGuards(AccessTokenGuard)
	async generatePosts(@User() user: UsersModel) {
		await this.postsService.generatePosts(user.id);
		return true;
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
	// @UseInterceptors(ClassSerializerInterceptor)
	getPost(@Param('id', ParseIntPipe) id: number) {
		//param으로 받으면 string으로 넘어옴
		//+를 붙여주면 number 가 됨
		return this.postsService.getPostById(id);
	}

	// 3)POST /posts
	// post를 생성한다
	//
	//DTO-Data Transfer Object(데이터 전송 객체)
	@Post()
	@UseGuards(AccessTokenGuard)
	//포스트맨 또는 클라이언트에서 실제로 이미지를 업로드할 때, 이미지라는 키값에 파일을 넣어서 보내면 된다
	async postPosts(
		//User 커스텀데코레이터로 user정보가져오기
		//파라미터로 UsersModel의 키값을 가져올 수 있게 해놓음
		@User('id') userId: number,
		@Body() body: CreatePostDto,
		// @Body('title') title: string,
		// @Body('content') content: string,
		//DefaultValuePipe의 경우 new로 인스턴스화를 해줌
		//new를 사용해서 인스턴스화를 하면 함수가 실행할때마다 계속 생김
		//ParseIntPipe는 클래스를 그냥 그대로 입력해줌
		//이건 NestJs의 IOC컨테이너에서 Inversion of Control컨테이너에서 자동으로 이 값을 주입해주는 것
		//결론적으로 작동하는데는 큰 차이가 없음
		//nestJs에서 dependency injection을 해주냐 안해주냐의 차이!
		// @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
	) {
		//트랜잭션과 관련된 모든 쿼리 러너를 담당함
		//쿼리 러너를 생성한다.
		const qr = this.dataSource.createQueryRunner();

		//쿼리 러너에 연결한다.
		await qr.connect();
		//쿼리 러너에서 트랜잭션을 시작한다.
		//이 시점부터 같은 쿼리 러너를 사용하면
		//트랜잭션 안에서 데이터베이스 액션을 실행할 수 있다.
		await qr.startTransaction();

		//로직 실행
		try {
			const post = await this.postsService.createPost(
				userId,
				body,
			);

			for (let i = 0; i < body.images.length; i++) {
				await this.postsService.createPostImage({
					post,
					order: i,
					path: body.images[i],
					type: ImageModelType.POST_IMAGE,
				});
			}

			await qr.commitTransaction();
			await qr.release();

			return this.postsService.getPostById(post.id);
		} catch (e) {
			//어떤 에러든 에러가 던져지면
			//트랜 잭션을 종료하고 원래 상태로 되돌린다.
			await qr.rollbackTransaction();
			await qr.release();
		}
	}

	// 4)PUT /posts/:id
	// id에 해당하는 POST를 변경한다.
	@Patch(':id')
	patchPost(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: UpdatePostDto,
		// @Body('title') title?: string,
		// @Body('content') content?: string,
	) {
		return this.postsService.updatePost(id, body);
	}

	// 5) DELETE /posts/:id
	// id에 해당되는 POST를 삭제한다.
	@Delete(':id')
	deletePost(@Param('id', ParseIntPipe) id: number) {
		return this.postsService.deletePost(+id);
	}
}
