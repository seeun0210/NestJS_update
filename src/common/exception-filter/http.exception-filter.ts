import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
    catch(exception:HttpException,host:ArgumentsHost){
        const ctx=host.switchToHttp();
        const response=ctx.getResponse();
        const request=ctx.getRequest();
        const status=exception.getStatus();
        const message=exception.message;

        //로그 파일을 생성하거나
        //에러 모니터링 시스템에 전송하는 등의 작업을 할 수 있다.
        
        response.status(status).json({
            statusCode:status,
            timestamp:new Date().toLocaleString('ko-KR'),
            path:request.url,
            message:message
        })
    }
}