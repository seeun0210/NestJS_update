import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsIn } from "class-validator";

export class BasePaginationDto{
    @IsNumber()
    @IsOptional()
    page?:number;

    // 이전 마지막 데이터의 ID
    // 이 프로퍼티에 입력된 ID 보다 높은 ID부터 값을 가져오기
    // @Type(()=>Number)
    // main.ts에서 자동으로 변환해주는 것으로 대체함
    @IsNumber()
    @IsOptional()
    where__id__more_than?:number;

    @IsNumber()
    @IsOptional()
    where__id__less_than?:number;

    // 정렬 기준
    // createdAt -> 생성된 시간의 내림차/오츪차 순으로 정렬
    @IsIn(['ASC', 'DESC'])
    @IsOptional()
    order__createdAt?: 'ASC' | 'DESC' = 'ASC';

    // 몇개의 데이터를 응답할지
    // 기본값은 20
    @IsNumber()
    @IsOptional()
    take:number=20;
}