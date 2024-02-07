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
  getAllPosts() {
    return posts;
  }

  getPostById(id: number) {
    const post = posts.find((post) => post.id === +id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  createPost(author: string, title: string, content: string) {
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

  updatePost(postId: number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === +postId);
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
    posts = posts.map((prevPost) =>
      prevPost.id === +postId ? post : prevPost,
    );
    return posts;
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
