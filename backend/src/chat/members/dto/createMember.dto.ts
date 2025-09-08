import { Channel } from "src/chat/channels/entities/channel.entity";
import { User } from "src/users/users.entity";

export class CreateMemberDto {
    user: User;
    Channel: Channel;
    isOwner: boolean;
    isAdmin: boolean;
    isMuted: boolean;
    isBanned: boolean;
}