import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

//socket.io가 연결하게되는 부분을 Gateway라고 부름
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
//OnGatewayConnection ->handleConnection이라는 함수 실행
//OnGatewayInit ->afterInit 이라는 함수 실행
//OnGatewayDisconnect ->handleDisconnection이라는 함수 실행
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatsMessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  //웹소켓 서버로 annotate를 해주기만 하면 server변수에 NestJs 프레임워크가 서버객체를 넣어줌
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    //gateway가 초기화 되었을 때 사용할 수 있는 함수
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`òn disconnect socketID::${socket.id}`);
  }

  //연결 되면 실행
  //소켓과 연결해서 사용자 정보를 지속시킬거임
  //소켓에 사용자 정보가 연결이되면 후에 소켓 정보가 다른 이벤트를 보낼 때 전부 다 지속이 됨!!
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);
    const headers = socket.handshake.headers;

    //Bearer xxxxxx
    const rawToken = headers['authorization'];

    if (!rawToken) {
      //   throw new WsException('토큰이 없습니다!');
      //토큰이 없으면 disconnect
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);

      const user = await this.usersService.getUserByEmail(payload.email);

      //소켓에 유저 정보 넣어주기
      socket.user = user;

      return true;
    } catch (e) {
      //   throw new WsException('유효하지 않은 토큰입니다.');
      //검증이 안되면 에러를 던지는 대신 연결을 끊는다
      socket.disconnect();
    }
  }

  //채팅room 만들기
  // validation Pipe가 글로벌로 여기에는 적용되지 않아서 따로 해줘야함
  // 근데 class-validator의 경우 HTTP exception을 extends하고 있음
  // 여기에서는 websocket Exception을 날려야 함
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  //   @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  //   @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('enter_chat')
  async enterChat(
    //방의 ID들을 리스트로 받는다.
    //하나의 방이 아니라 여러개의 방에 join하고 싶을 수 있으니..!
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // for (const chatId of data) {
    //socket.join()
    //   socket.join(chatId.toString());
    // }

    //굳이 존재하지 않는 방에 들어가느건 리소스 낭비
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        });
      }
    }

    //for loops를 돌지 않고
    //이렇게 해도 방에 들어갈 수 있음
    socket.join(data.chatIds.map((x) => x.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  //메시지를 보낼 때 마다 검증을 할 필요 없음
  //사용자를 소켓과 연결시킬때만!!
  //그럼 어떻게 사용자 정보를 가져오지??
  //   @UseGuards(SocketBearerTokenGuard)
  //socket.on('send_message',(message)=>{console.log(message)})
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    //클라이언트에서 sendMessage를 받자마자 서버에 연결된 모든 소켓들에게 receiveMessage 이벤트를 보냄
    //사용자를 구분하지 않고 모두에게 보냄
    // this.server
    //   //들어간 방에만 메시지를 보낸다
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);

    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException({
        message: `존재하지 않는 채팅방입니다. chatId: ${dto.chatId}`,
      });
    }

    //채팅방이 존재하면 메시지를 저장
    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    );

    //나를 제외한 사람들에게 메시지 보내기
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
