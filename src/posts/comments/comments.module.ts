import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsModel])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
