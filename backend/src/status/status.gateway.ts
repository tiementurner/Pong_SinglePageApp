import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Status } from './Status'
import { Socket, Server } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { IsBoolean, IsString } from 'class-validator';
import { RoomService } from 'src/game/room.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

class IncomingHeartbeat {
  @IsString()
  userID: string;
  
  @IsBoolean()
  activity:boolean;
}

class Friend {
  @IsString()
  friendID: string;
}

@WebSocketGateway({cors: true, namespace: 'status'})
export class StatusGateway {
  constructor(
    private allStatus:Status,
    private readonly authService: AuthService,
    private readonly usersService: UsersService

  ){};

  @WebSocketServer()
    server:Server;

  async handleConnection(client:Socket){
		console.log(`client ${client.id} trying to connect for status, awaiting authorization`);
		const code = client.handshake.headers['authorization'];
		//const userId = Number(client.handshake.headers['userid']); voor testen via postman
		
		const userId = this.authService.getUserDataByCode(code);
    const user = await this.usersService.findById(userId);
		if (userId == null || user == null) {
			console.log(`client ${client.id} failed authorization.`);
			client.disconnect(true);
			return;
		}
		//console.log(`user ${userId} authorized for status connection ${client.id}`);

		client['userId'] = userId;
		client.join(`user${userId}`);
		this.authService.deleteTemporaryCode(code);
  

    //if the user has another tab open, then doesn't need to send the status multiple times
    //if the user has no other tab open, send a message to retrieve userID
    const intervalID = setInterval(()=>{
      const userID:string|undefined = this.allStatus.findID(client.id);
      if (userID){
        client.emit("myStatus", {status:this.allStatus.getMyStatus(userID)});
        // console.log("emit mystatus for userID:", this.allStatus.getMyStatus(userID), userID);
      }
    }, 1000);
  }

  handleDisconnect(client:Socket){
    // console.log(`client: ${client.id} had disconnected`);
    this.allStatus.removeClient(client.id);
  }

  @SubscribeMessage('Heartbeat')
  @UsePipes(new ValidationPipe({transform: true}))
  handleMessage(client: Socket, payload: IncomingHeartbeat):void {
  //console.log("heartbeat", payload.userID);
	if (payload)
    	this.allStatus.updateStatus(payload.userID, payload.activity);
  }

  @SubscribeMessage("newSocket")
  addConnection(client: Socket, payload:{userID:string}){
    //console.log("newSocket message");
    this.allStatus.addConnection(client, payload.userID);
    this.allStatus.updateStatus(payload.userID, true);
  }


  @SubscribeMessage("get_friend_status")
  @UsePipes(new ValidationPipe({transform: true}))
  sendFriendsStatus(client:Socket, payload: Friend){
    // console.log("get_friend message");
    const stringID:string = payload.friendID;
    const friendStatus = this.allStatus.getFriendStatus(stringID);
    // console.log("friend status:", stringID, friendStatus);
    this.server.emit(`friend_status${payload.friendID}`, friendStatus);
  }
}

