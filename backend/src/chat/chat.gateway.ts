import {
	UsePipes,
	ValidationPipe } from '@nestjs/common';
import {
	WebSocketGateway, 
	SubscribeMessage, 
	MessageBody, 
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect, 
	ConnectedSocket } from '@nestjs/websockets';
import {
	Namespace,
	Socket } from 'socket.io'
import {
	IsAlphanumeric,
	IsString } from 'class-validator';

import { messageService } from './messages/message.service';
import { CreateMessageDto } from './messages/dto/createMessage.dto';
import { UsersService } from 'src/users/users.service';
import { ChannelService } from './channels/channel.service';
import { MemberService } from './members/member.service';
import { ChatService } from './chat.service';
import { RoomService } from 'src/game/room.service';
import { Status } from 'src/status/Status';
import { AuthService } from 'src/auth/auth.service';

class IncomingMessage {
	@IsString()
	message:string;

	@IsAlphanumeric()
	channel: number;
};

@WebSocketGateway( {cors: true, namespace: 'chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
		private readonly messageService: messageService,
		private readonly usersService: UsersService,
		private readonly channelService: ChannelService,
		private readonly memberService: MemberService,
		private readonly chatService: ChatService,
		private readonly authService: AuthService,
		private readonly allStatus: Status
    ) {}
    
	private userClient:Map<string, number> = new Map();//saves the client to userId's

    @WebSocketServer() io: Namespace;
    
    afterInit() {
      console.log("Websocket message Gateway initialized.");
    }

    async handleConnection(client: Socket) {
      
		console.log(`client ${client.id} trying to connect for chatting, awaiting authorization`);

		const code = client.handshake.headers['authorization'];
		//const userId = Number(client.handshake.headers['userid']); voor testen via postman
		
		const userId = this.authService.getUserDataByCode(code);
    	const user = await this.usersService.findById(userId);
		if (userId == null || user == null) {
			console.log(`client ${client.id} failed authorization.`);
			client.disconnect(true);
			return;
		}
		
		console.log(`user ${userId} authorized for chatting connection ${client.id}`);

		client['userId'] = userId;
		client.join(`user${userId}`);
		this.authService.deleteTemporaryCode(code);
		this.allStatus.setStatusInChat(userId.toString());
		this.userClient.set(client.id, userId);
    }

    handleDisconnect(client: Socket) {
		const userId = this.userClient.get(client.id);
		if (userId)
			this.allStatus.removeStatusInChat(userId.toString());
    	console.log(`Client ${client.id} disconnected`);
    }
    
    @SubscribeMessage('message')
    @UsePipes(new ValidationPipe({transform: true}))
    async handleMessage(
      @MessageBody() data: IncomingMessage, 
      @ConnectedSocket() client: Socket
    ) {

		const user = await this.usersService.findById(client['userId']);
		const channel = await this.channelService.findById(data.channel);

		if (!channel || !user)
			return;
	
		const member = await this.memberService.findMember(channel.id, user.id);
		if (!member || member.isMuted === true)
			return;

		const newMessage: CreateMessageDto = {
			channel:      channel,
			user:         user,
			message_text: data.message,
			timestamp:    Date()
		};
		const createdmsg = await this.messageService.createMessage(newMessage);
		
		const emitMessage = {
			message_id: createdmsg.message_id,
			message_text: createdmsg.message_text,
			timestamp: createdmsg.timestamp,
			user: {
				id: createdmsg.user.id,
				username: createdmsg.user.username
			}
		}

		const membersInChannel = await this.channelService.getChannelMembers(channel.id);
		const blockers = await this.chatService.getBlockers(user);
		const unblockedMembers = membersInChannel.filter(member => !blockers.includes(member.id));

		for (const member of unblockedMembers) {
			this.io.to(`user${member.id}`).emit(`channel${channel.id}`, emitMessage);
		}
    }
}
