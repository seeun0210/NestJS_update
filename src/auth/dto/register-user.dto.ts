import { PickType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { UsersModel } from 'src/users/entity/users.entity';

export class RegisterUserDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
