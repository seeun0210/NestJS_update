import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
//nestJs에서 customPipe를 만드려면 얘네들을 불러와야 함

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 이렇게 하면 파이프로 들어온 값이 그대로 반환됨
    // return value;
    // value: 실제로 파이프로 들어온 값
    // metadata: 현재 처리 중인 값에 대한 추가적인 컨텍스트 정보를 제공합니다. 예를 들어, 처리 중인 데이터의 타입, 파라미터의 메타데이터 등이 포함될 수 있습니다.
    if (value.toString().length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요!');
    }
    return value.toString();
  }
}
