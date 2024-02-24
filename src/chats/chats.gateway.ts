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

//socket.io가 연결하게되는 부분을 Gateway라고 부름
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  //웹소켓 서버로 annotate를 해주기만 하면 server변수에 NestJs 프레임워크가 서버객체를 넣어줌
  @WebSocketServer()
  server: Server;

  //연결 되면 실행
  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  //채팅room 만들기
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
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    //클라이언트에서 sendMessage를 받자마자 서버에 연결된 모든 소켓들에게 receiveMessage 이벤트를 보냄
    //사용자를 구분하지 않고 모두에게 보냄
    // this.server
    //   //들어간 방에만 메시지를 보낸다
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);

    //나를 제외한 사람들에게 메시지 보내기
    socket
      .to(message.chatId.toString())
      .emit('receive_message', message.message);
  }
}
