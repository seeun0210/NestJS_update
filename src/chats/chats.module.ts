import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { ChatsMessagesService } from './messages/messages.service';
import { MessagesModel } from './messages/entity/messages.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { UsersService } from 'src/users/users.service';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer-token.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([ChatsModel, MessagesModel, UsersModule]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService, ChatsMessagesService, AuthService],
})
export class ChatsModule {}
