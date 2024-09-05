import { Channel } from "src/chat/channels/entities/channel.entity";
import { User } from "src/users/users.entity";

export class CreateMessageDto {

    channel: Channel;

    user: User;

    message_text: string;

    timestamp: string;
}