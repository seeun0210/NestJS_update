import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { BaseModel } from './entity/base.entity';
import {
	FindManyOptions,
	FindOptions,
	FindOptionsOrder,
	FindOptionsWhere,
	Repository,
} from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mappter.const';
import { HOST, PORT, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
	async paginate<T extends BaseModel>(
		dto: BasePaginationDto,
		repository: Repository<T>,
		overrieFindOptions: FindManyOptions<T> = {},
		path: string,
	) {
		if (dto.page) {
			return this.pagePaginate(
				dto,
				repository,
				overrieFindOptions,
				path,
			);
		} else {
			return this.cursorPaginate(
				dto,
				repository,
				overrieFindOptions,
				path,
			);
		}
	}

	private async cursorPaginate<T extends BaseModel>(
		dto: BasePaginationDto,
		repository: Repository<T>,
		overrideFindOptions: FindManyOptions<T> = {},
		path: string,
	) {
		/**
		 * where__likeCount__more_than
		 *
		 * where__title__ilike
		 */
    const findOptions = this.composeFindOptions<T>(dto);
    
    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    } );
    const lastItem = results.length > 0 && results.length === dto.take ? results[results.length - 1] : null;
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}:${PORT}/${path}`);
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
          if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }
    return {
      data:results,
      cursor:{
        after:lastItem?.id ?? null,
      },
      count:results.length,
      next:nextUrl?.toString()??null,
    };
	}

	private composeFindOptions<T extends BaseModel>(
		dto: BasePaginationDto,
	): FindManyOptions<T> {
		/**
		 * where,
		 * order,
		 * take,
		 * skip -> page 기반일때만
		 */

		/**
		 * DTO의 현재 생긴 구존느 아래와 같음
		 * {
		 *  where__id__more_than:100,
		 *  order__createdAt:'DESC'
		 * }
		 *
		 * 현재는 where__id__more_than / where__id__less_than에 해당되는 where필터만 사용중이지만
		 *  나중에 where__likeCount__more_than 이나 where__title__ilike 와 같은 필터가 추가될 수 있음
		 *  모든 where필터 들을 자동으로 파싱 할 수 있을만한 기능을 제작해야한다.
		 *
		 * 1) where로 시작한다면 필터로직을 적용한다
		 * 2) order로 시작한다면 정렬로직을 적용한다
		 * 3) 필터 로직을 적용한다면 '__' 기준으로 split했을 때 3개의 값으로 나뉘는지 2개의 값으로 나뉘는지 확인한다.
		 *    3-1) 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
		 *    ['where','id','more_than']
		 *    3-2) 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다.
		 *      where__id
		 *    ['where','id']
		 * 4) order의 경우 3-2와 같이 적용한다.
		 */
		let where: FindOptionsWhere<T> = {};
		let order: FindOptionsOrder<T> = {};

		for (const [key, value] of Object.entries(dto)) {
			// key -> where__id__less_than
			// value -> 1
			if (key.startsWith('where__')) {
				where = {
					...where,
					...this.parseWhereFilter(key, value),
				};
			} else if (key.startsWith('order__')) {
				order = {
					...order,
					...this.parseWhereFilter(key, value),
				};
			}
		}

		return {
			where,
			order,
			take: dto.take,
			skip: dto.page
				? (dto.page - 1) * dto.take
				: null,
		};
	}

	private parseWhereFilter<T extends BaseModel>(
		key: string,
		value: any,
	): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options:FindOptionsWhere<T>={};

    /**
     * 예를들어 where__id__more_than
     * __를 기준으로 나눴을 때
     * 
     * ['where','id','more_than']으로 나눌 수 있다.
     */
    const split =key.split('__');

    if(split.length!==2&&split.length!==3) {
      throw new BadRequestException(`where필터는 '__'로 split했을 때 길이가 2 또는 3이어야 합니다.: ${key}`);
    }

    /**
     * 길이가 2일 경우는 
     * 
     * where__id=3
     * 
     * FindOptionsWhere로 풀어보면 
     * 아래와 같다. 
     * {
     *  where:{
     *    id:3
     *  }
     * }
     */
    if(split.length===2){
      // ['where','id']
      const [_,field]=split;

      /**
       * field -> 'id
       * value -> 3
       * {
       *  id:3
       * }
       */
      options[field]=value;
    }else{
      /**
       * 길이가 3일 경우에는 TypeORM 유틸리티 적용이 필요한 경우다.
       * 
       * where__id__more_than의 경우 
       * where는 버려도 되고 두번째 값은 필터링할 키값이 되고 
       * 세번째 값은 typeorm 유틸리티가 된다.
       * 
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후 
       * 값에 적용 해준다.
       */
      const [_,field, operator]=split;

      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다
      const values=value.toString().split(',');
      // field -> id
      // operator -> more_than
      // FILTER_MAPPER[operator] -> MoreThan
      options[field]= FILTER_MAPPER[operator](values[0]);
      if(operator==='between'){
        options[field]=FILTER_MAPPER[operator](values[0],values[1]);
      }
      if(operator==='i_like'){
        options[field]=FILTER_MAPPER[operator](`%${values[0]}%`);
      }
      
    }
    return options;
  }

	private async pagePaginate<T extends BaseModel>(
		dto: BasePaginationDto,
		repository: Repository<T>,
		overrieFindOptions: FindManyOptions<T> = {},
		path: string,
	) {
    const findOptions = this.composeFindOptions<T>(dto);
    const [data,count]=await repository.findAndCount({
      ...findOptions,
      ...overrieFindOptions,
    });

    return {
      data,
      total: count,
    };
  }
}
