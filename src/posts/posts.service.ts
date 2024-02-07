import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}
export let posts: PostModel[] = [
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
    return await this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(author: string, title: string, content: string) {
    //1) create -> 저장할 객체를 생성한다.
    //2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(
    postId: number,
    author: string,
    title: string,
    content: string,
  ) {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면(id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재하다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException();
    }
    if (author) {
      post.author = author;
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

  deletePost(postId: number) {
    const post = posts.find((post) => post.id === +postId);
    if (!post) {
      throw new NotFoundException();
    }
    posts = posts.filter((post) => post.id !== +postId);
    return postId;
  }
}
