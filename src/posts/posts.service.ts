import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
//주입 할 수 있다.
//1. 프로바이더로 생성하고 싶은 클래스는 모듈에다 등록해주기
//2. @Injectable() 어노테이션 해주기
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}
  async getAllPosts() {
    return await this.postsRepository.find({ relations: ['author'] });
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
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
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);

    return newPost;
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
