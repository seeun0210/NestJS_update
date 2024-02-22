import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const user = req.user;

  if (!user) {
    throw new InternalServerErrorException(
      'User decorator는 AccessToken guard와 함께 사용해야합니다. Request에 user 프로퍼티가 존재하지 않습니다',
    );
  }
  return user;
});