import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChannelModule } from "src/chat/channels/channel.module";
import { messageModule } from './messages/message.module';
import { MemberModule } from './members/member.module'
import { ChatController } from './chat.controller'
import { ChatGateway } from './chat.gateway'
import { UsersModule } from "src/users/users.module";
import { BlockList } from "./blockedlist.entity";
import { ChatService } from "./chat.service"
import { GameModule } from "src/game/game.module";
import { StatusModule } from "src/status/status.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [   
        ChannelModule, 
        messageModule,
        MemberModule,
        UsersModule,
        TypeOrmModule.forFeature([BlockList]),
        GameModule,
        StatusModule,
        AuthModule
    ],
    controllers: [ChatController],
    providers: [
		ChatGateway,
		ChatService
	],
    exports: []
})

export class ChatModule {}