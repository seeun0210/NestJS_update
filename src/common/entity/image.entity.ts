import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { BaseModel } from "./base.entity";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { POST_PUBLIC_IMAGE_PATH } from "../const/path.const";
import { join } from "path";
import { promises as fs } from "fs";
import { PostsModel } from "src/posts/entity/posts.entity";
import { BadRequestException } from "@nestjs/common";

export enum ImageModelType {
    POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
    @Column({ default: 0 })
    @IsInt()
    @IsOptional()
    order: number;

    //UsersModel -> 사용자 프로필 이미지
    //PostsModel -> 포스트 이미지

    @Column({
        enum: ImageModelType
    })
    @IsEnum(ImageModelType)
    @IsString()
    type: ImageModelType;

    @Column()
    @IsString()
    @Transform(async ({ value, obj }) => {
        if (obj.type === ImageModelType.POST_IMAGE) {
            return `/${join(POST_PUBLIC_IMAGE_PATH, value)}`;
        } else {
            return value;
        }
    })
    path: string

   @ManyToOne((type)=>PostsModel,(post)=>post.images)
    post?:PostsModel;
}




