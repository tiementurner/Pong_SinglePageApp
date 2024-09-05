import { WebSocketGateway, 
    SubscribeMessage, 
    MessageBody, 
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayInit,
    OnGatewayDisconnect, 
    ConnectedSocket} from '@nestjs/websockets';
import {Namespace, Server, Socket} from 'socket.io'
import { NotificationService } from './notification.service';
import { UsersService } from 'src/users/users.service';
import { FriendsService } from 'src/friends/friends.service';
import { RoomService } from 'src/game/room.service';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

class Receiver {
    @IsNumber()
    receiverId: number
}

class FriendRequestAccepted {
    @IsNumber()
    friendId: number;

    @IsNumber()
    requestId: number;

    @IsNumber()
    notificationId: number;
}

class MatchRequest{
    @IsNumber()
    receiverId: number;
    
    @IsNumber()
    level: number;
}

class MatchAccept{
    @IsNumber()
    challengerId: number;
    
    @IsNumber()
    notificationId: number;
}

@WebSocketGateway({namespace: "notification", cors: true})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
//implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly notifService : NotificationService,
        private readonly usersService: UsersService,
		private readonly friendService: FriendsService,
        private readonly authService: AuthService
    ) {}

    @WebSocketServer() io: Namespace;

    afterInit() {
        console.log("Websocket notification Gateway initialized.");
    }

    async handleConnection(client: Socket) {
    
        console.log(`client ${client.id} trying to connect for notification, awaiting authorization`);
        const code = client.handshake.headers['authorization'];
        const userId = this.authService.getUserDataByCode(code);

        //line below is for postman testing
        // const userId = Number(client.handshake.headers['userid']);
        if (userId == null) {
            console.log(`client ${client.id} failed authorization.`);
            client.disconnect(true);
            return;
        }
        const user = await this.usersService.findById(userId);
        if (!user) {
            console.log(`client ${client.id} failed authorization.`);
            client.disconnect(true);
            return;
        }
        
        console.log(`user ${userId} authorized for notification connection ${client.id}`);
        client['userId'] = userId;
        client.join(`user${userId}`);
        this.authService.deleteTemporaryCode(code);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client ${client.id} disconnected`);
    }

//!wat als iemand friend request of anderszins notificatie krijgt tijdens dat ze een s[pel aan het spelen zijn
    @SubscribeMessage('friend_request')
    @UsePipes(new ValidationPipe({transform: true}))
    async handleFriendRequest(
        @MessageBody() data: Receiver, 
        @ConnectedSocket() client: Socket
    ){
        // console.log("Friend request incoming");
        //user that sent request
        const sender = await this.usersService.findById(client['userId']);
        //user that will receive request
        const receiver = await this.usersService.findById(data.receiverId);
		const friendRequest = await this.friendService.makeFriendRequest(sender, receiver);
        if (!friendRequest)
            return;
    
        const notification = await this.notifService.create(sender, receiver, "friend", "request", false, friendRequest.friendid); //! hierbij nadenken is het mogelijk dat de friendrequest create call NULL teruggeeft? if so dereferencing here will be a problem i think
		this.io.to(`user${receiver.id}`).emit(`notification`,
		{
			id: notification.id,
			sender: {
				id: sender.id,
				username: sender.username
			},
			feature: "friend",
			type: "request",
			response: false,
			message: `${sender.username} has sent you a friend request`,
			type_id: friendRequest.friendid
		}
	);
    }

    @SubscribeMessage('friend_request_accepted')
    @UsePipes(new ValidationPipe({transform: true}))
    async handleFriendRequestAccepted(
        @MessageBody() data: FriendRequestAccepted, 
        @ConnectedSocket() client: Socket
    ){
        //variable: person that sent the friend request
        const friend = await this.usersService.findById(data.friendId);

        //variable: person that accepted the friend request
        const user = await this.usersService.findById(client['userId']);

		//action: accept friend request
		await this.friendService.accept(data.requestId);
        
		//action: edit notification so that original sender will now get "request accepted" notification
		await this.notifService.remove(data.notificationId);
		const newNotification = await this.notifService.create(user, friend, "friend", "response", true, data.friendId);
		// await this.notifService.friendAcceptedNotif(data.notificationId, user, friend);

        this.io.to(`user${friend.id}`).emit(`notification`,
			{
				id: newNotification.id,
				sender: {
					id: user.id,
					username: user.username
				},
				feature: "friend",
				type: "response", //going to treat every friend response notification as an accepted notification, because we won't notify users if a friend request has been rejected
				response: true,
				message: `${user.username} has accepted your friend request`,
				type_id: data.requestId
			}
		);
    }

    @SubscribeMessage('invite_for_game')
    @UsePipes(new ValidationPipe({transform: true}))
    async inviteForMatch(
        @MessageBody() data: MatchRequest, 
        @ConnectedSocket() client: Socket
    ){
        console.log("Match invite incoming");
        //user that sent request
        const sender = await this.usersService.findById(client['userId']);
        //user that will receive request
        const receiver = await this.usersService.findById(data.receiverId);
        console.log(sender.id + "  " + receiver.id);
        if (sender.id == receiver.id)
            return;
    
        const notification = await this.notifService.create(sender, receiver, "game", "request", false); //! hierbij nadenken is het mogelijk dat de friendrequest create call NULL teruggeeft? if so dereferencing here will be a problem i think
		this.io.to(`user${receiver.id}`).emit(`notification`,
        {
            id: notification.id,
            sender: {
                id: sender.id,
                username: sender.username
            },
            feature: "game",
            level: data.level,
            type: "request",
            response: false,
            message: `${sender.username} has invited you for a match`,
        });
    }


    @SubscribeMessage('game_invite_accepted')
    @UsePipes(new ValidationPipe({transform: true}))
    async handleGameInviteAccepted(
        @MessageBody() data: MatchAccept, 
        @ConnectedSocket() client: Socket
    ){
        const friend = await this.usersService.findById(data.challengerId);
        const user = await this.usersService.findById(client['userId']);
        
		//action: edit notification so that original sender will now get "request accepted" notification
		await this.notifService.remove(data.notificationId);
		const newNotification = await this.notifService.create(user, friend, "game", "response", true);

        this.io.to(`user${friend.id}`).emit(`notification`,
			{
				id: newNotification.id,
				sender: {
					id: user.id,
					username: user.username
				},
				feature: "game",
				type: "response", //going to treat every friend response notification as an accepted notification, because we won't notify users if a friend request has been rejected
				response: true,
				message: `${user.username} has accepted your game invite! Find your match in the game section`,
			}
		);
    }
}
