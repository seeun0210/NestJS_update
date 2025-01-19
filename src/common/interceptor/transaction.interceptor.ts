import {
	CallHandler,
	ExecutionContext,
	InternalServerErrorException,
	NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

export class TransactionInterceptor
	implements NestInterceptor
{
	constructor(private readonly dataSource: DataSource) {}
	async intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Promise<Observable<any>> {
		const req = context.switchToHttp().getRequest();

		const qr = this.dataSource.createQueryRunner();

		//쿼리 러너에 연결한다.
		await qr.connect();
		//쿼리 러너에서 트랜잭션을 시작한다.
		//이 시점부터 같은 쿼리 러너를 사용하면
		//트랜잭션 안에서 데이터베이스 액션을 실행할 수 있다.
		await qr.startTransaction();

		//request객체에 qr을 넣어준다.
		req.queryRunner = qr;

		return next.handle().pipe(
			catchError(async (e) => {
				await qr.rollbackTransaction();
				await qr.release();

				throw new InternalServerErrorException(e.message);
			}),
			tap(async () => {
				//정상적으로 transaction이 실행 되었을 때
				await qr.commitTransaction();
				await qr.release();
			}),
		);
	}
}
