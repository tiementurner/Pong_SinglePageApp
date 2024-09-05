import {
	Controller,
	ForbiddenException,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UseGuards } from "@nestjs/common";

import { MemberService } from "./members/member.service";
import { messageService } from "./messages/message.service";
import { ChannelService } from "./channels/channel.service";
import { ChatService } from "./chat.service";
import { User } from "src/users/users.entity";
import { AuthenticationGuard } from "src/auth/authentication.guard";
import { getUser } from "src/users/user.decorator";

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatmsgService: messageService,
        private readonly channelService: ChannelService,
        private readonly chatService: ChatService,
        private readonly memberService: MemberService
    ) {}

	@Get('blocklist')
    @UseGuards(AuthenticationGuard)
	async getBlocklist(
		@getUser() user: User
	) {
		return this.chatService.getBlocked(user);
	}

    @Post('block/:targetuser')
    @UseGuards(AuthenticationGuard)
    async block(
        @Param('targetuser', ParseIntPipe) targetUser: number,
        @getUser() user: User
    ) {
        try {
            await this.chatService.blockUser(user, targetUser);
            return;
        } catch (error) {
            throw error;
        }
    }

    @Post('unblock/:targetuser')
    @UseGuards(AuthenticationGuard)
    async unblock(
        @Param('targetuser', ParseIntPipe) targetUser: number,
        @getUser() user: User
    ) {
        try {
            await this.chatService.unblockUser(user, targetUser);
            return;
        } catch (error) {
            throw error;
        }
    }

	@Get(':channelId/messages')
    @UseGuards(AuthenticationGuard)
    async getMessagesfromChannel(
        @Param('channelId', ParseIntPipe) channelId: number,
        @getUser() user: User
    ) {
	
        if (!(await this.memberService.findMember(channelId, user.id)))
            throw new ForbiddenException(`user ${user.id} is not a member of this channel`);

        const channel = await this.channelService.findById(channelId);
        const messages = await this.chatmsgService.findAllMessagesInChannel(channel);
        const blockedUsers = await this.chatService.getBlocked(user)
        
        /** filter out blocked users' messages */
        var i = messages.length;
        while (i--) {
            if (blockedUsers.includes(messages[i].user.id))
                messages.splice(i, 1);
        }
        return (messages);
    }
}