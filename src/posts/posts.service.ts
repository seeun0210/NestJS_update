import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagenate-post.dto';
import { HOST, PORT, PROTOCOL } from 'src/common/const/env.const';
import { CommonService } from 'src/common/common.service';
import { POST_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
//주입 할 수 있다.
//1. 프로바이더로 생성하고 싶은 클래스는 모듈에다 등록해주기
//2. @Injectable() 어노테이션 해주기
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
  ) { }

  async getAllPosts() {
    return await this.postsRepository.find({ ...DEFAULT_POST_FIND_OPTIONS });
  }

  //1) 오름차순으로 정렬하는 pagination만 구현한다.
  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(dto, this.postsRepository, {
      ...DEFAULT_POST_FIND_OPTIONS,
    }, 'posts');
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    if (dto.page) {
      return this.pagePaginatePosts(dto);
    } else {
      return this.cursorPaginatePosts(dto);
    }
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    } else if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}:${PORT}/posts`);
    if (nextUrl) {
      /**
       * dto의 키값들을 루핑하면서 
       * 키값에 해당되는 밸류가 존재하ㅕㄴ 
       * param에 추가해준다.
       * 
       * 단, where__id_more_than 값만 lastItem의 마자믹 값으로 넣어준다
       * 
       */
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else {
        key = 'where__id_less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    /**
  * 
  * Response:
  * {
  *  data: Data[]
  *  cursor:{
  *    after: number,
  *  },
  *  count: 응답한 데이터의 갯수,
  *  next: 다음 요청을 할 때 사용할 URL
  * }
  */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString(),
    }
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 post ${i}`,
        content: `임의로 생성된 post ${i}`,
        images: [],
      });
    }
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id },
    });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    //1) create -> 저장할 객체를 생성한다.
    //2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author: {
        //연동할 author의 정보를 넣어준다
        id: authorId,
      },
      ...postDto,
      images:[],
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async createPostImage(dto: CreatePostImageDto) {
    //dto의 이미지 이름을 기반으로 
    //파일의 경로를 생성한다.
    const tempFilePath = join(
      TEMP_FOLDER_PATH,
      dto.path
    )

    try {
      //access: 해당 경로의 파일에 접근이 가능한지 알려줌
      promises.access(tempFilePath)
    } catch (e) {
      throw new BadRequestException('존재하지 않는 파일 입니다.')
    }

    //basename: 파일 이름만 추출
    const fileName = basename(tempFilePath)

    //새로 이동할 포스트 폴더의 경로 + 이미지 이름
    const newPath = join(
      POST_IMAGE_PATH,
      fileName
    )
    
    //save
    const result = await this.imageRepository.save({...dto})

    //파일 옮기기
    await promises.rename(tempFilePath, newPath)

    return result;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면(id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재하다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException();
    }
    await this.postsRepository.delete(postId);
    return postId;
  }
}
