import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginatePostDto extends BasePaginationDto {
	@IsOptional()
	@IsNumber()
	where__likeCount__more_than?: number;

    @IsOptional()
    @IsString()
    where__title__i_like?:string;
}
