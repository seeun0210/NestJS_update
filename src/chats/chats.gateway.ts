import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

//socket.io가 연결하게되는 부분을 Gateway라고 부름
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  //웹소켓 서버로 annotate를 해주기만 하면 server변수에 NestJs 프레임워크가 서버객체를 넣어줌
  @WebSocketServer()
  server: Server;

  //연결 되면 실행
  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    //방의 ID들을 리스트로 받는다.
    //하나의 방이 아니라 여러개의 방에 join하고 싶을 수 있으니..!
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data) {
      //socket.join()
      socket.join(chatId.toString());
    }
  }

  //socket.on('send_message',(message)=>{console.log(message)})
  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: { message: string; chatId: number }) {
    //클라이언트에서 sendMessage를 받자마자 서버에 연결된 모든 소켓들에게 receiveMessage 이벤트를 보냄

    this.server
      //들어간 방에만 메시지를 보낸다
      .in(message.chatId.toString())
      .emit('receive_message', message.message);
  }
}
