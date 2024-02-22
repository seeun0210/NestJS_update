import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  MaxLengthPipe,
  MinLengthPipe,
  PasswordPipe,
} from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    /**
     * {accessToken: {token}}
     */
    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    /**
     * {refreshToken: {token}}
     */
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(@Headers('authorization') rawToken: string) {
    //email:password-> Base64
    //adfagafdkjaksjdfasjs:adfadfasf->email:password
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    //파이프에서 통과되지 않으면 아래의 로직은 실행되지 않음
    @Body(
      'password',
      new MaxLengthPipe(8, '비밀번호'),
      new MinLengthPipe(3, '비밀번호'),
    )
    password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }
}
