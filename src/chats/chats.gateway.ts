import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

//socket.io가 연결하게되는 부분을 Gateway라고 부름
@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  //연결 되면 실행
  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  //socket.on('send_message',(message)=>{console.log(message)})
  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: string) {
    console.log(message);
  }
}
