import {
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

  //socket.on('send_message',(message)=>{console.log(message)})
  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: string) {
    //클라이언트에서 sendMessage를 받자마자 서버에 연결된 모든 소켓들에게 receiveMessage 이벤트를 보냄
    this.server.emit('receive_message', 'hello from server');
  }
}
