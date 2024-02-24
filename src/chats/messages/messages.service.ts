import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entity/messages.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateMessagesDto } from './dto/create-messages.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    // private readonly commonService: CommonService,
  ) {}

  async createMessage(dto: CreateMessagesDto) {
    const message = await this.messagesRepository.save({
      chat: {
        id: dto.chatId,
      },
      author: {
        id: dto.authorId,
      },
      message: dto.message,
    });
    return this.messagesRepository.findOne({
      where: {
        id: message.id,
      },
    });
  }
}
