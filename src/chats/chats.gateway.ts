import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception-filter';

//socket.io가 연결하게되는 부분을 Gateway라고 부름
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatsMessagesService,
  ) {}

  //웹소켓 서버로 annotate를 해주기만 하면 server변수에 NestJs 프레임워크가 서버객체를 넣어줌
  @WebSocketServer()
  server: Server;

  //연결 되면 실행
  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
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
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  async enterChat(
    //방의 ID들을 리스트로 받는다.
    //하나의 방이 아니라 여러개의 방에 join하고 싶을 수 있으니..!
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
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

  //socket.on('send_message',(message)=>{console.log(message)})
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket,
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
    const message = await this.messagesService.createMessage(dto);

    //나를 제외한 사람들에게 메시지 보내기
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
