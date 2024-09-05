import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/createMessage.dto'
import { Channel } from 'src/chat/channels/entities/channel.entity';

@Injectable()
export class messageService {
	constructor(
		@InjectRepository(Message)
    	private readonly msgRepository: Repository<Message>
) {}

	async findAllMessagesInChannel(channel: Channel) {

		return await this.msgRepository
			.createQueryBuilder("messages")
			.leftJoin("messages.user", "user")
			.where("messages.channel.id = :channelId", {channelId: channel.id})
			.addSelect("user.username")
			.addSelect("user.id")
			.orderBy("messages.message_id", "ASC")
			.getMany();
	}

	async createMessage(createMessageDto: CreateMessageDto): Promise <Message> {
    	
		const message = this.msgRepository.create({...createMessageDto});
    	return await this.msgRepository.save(message);
  	}
}