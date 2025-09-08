import { MessageBody, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, } from '@nestjs/websockets';
import { GameHistoryService } from 'src/gamehistory/gamehistory.service';
import { Socket, Server } from 'socket.io';
import { Game } from 'src/game/GameEasy';
import { RoomInfo } from 'src/game/GameResources';
import { Room } from 'src/game/room.classes';
import { PrivateRoom } from 'src/game/GamePrivate';
import { GameHeartbeat } from './GameHeartbeat';
import { Status } from 'src/status/Status';
import { RankingService } from 'src/users/ranking/ranking.service';
import { UsersService } from 'src/users/users.service';
import { GameHard } from './GameHard';
import { IsAlphanumeric, IsNumber, IsOptional, ValidationError } from 'class-validator';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

class GamePayload {
  @IsAlphanumeric()
  userID: string;

  @IsNumber()
  @IsOptional()
  roomnbr: number;
}

@WebSocketGateway({cors: true, namespace: 'game'})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly rooms: RoomInfo,
    private readonly status:Status, 
    private readonly rankingService: RankingService,
    private readonly gameHistoryService: GameHistoryService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {};

  private connections = [];
  private heartbeat: GameHeartbeat = new GameHeartbeat(this.rooms, this.status);


  afterInit(io: any) {
    console.log("Websocket message Gateway initialized.");
  }

  async handleConnection(client: Socket, io: any) {
    
    //console.log(`client ${client.id} trying to connect for game, awaiting authorization`);
    const code = client.handshake.headers['authorization'];
    const userId = this.authService.getUserDataByCode(code);
  
    //const userId = Number(client.handshake.headers['userid']); voor testen via postman
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
    
    console.log(`user ${userId} authorized for game connection ${client.id}`);
    client['userId'] = userId;
    client.join(`user${userId}`);
    this.authService.deleteTemporaryCode(code);
  }

  asyncTimeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  

//these 2 functions handles when a player quits the game deliberately
//one point is reduced when a player quits

  async handleDisconnect(client:Socket){
    console.log(`Client disconnected: ${client.id}`);
    const findID = ():string=>{
      for (let i = 0; i < this.connections.length; i+=1){
        if (this.connections[i].client === client.id){
          const userID = this.connections[i].userID;
          this.connections.splice(i, 1);
          return (userID);
        }
      }
      return ("");
    }
    const findClient = (userID:string):boolean=>{
      for (let i = 0; i < this.connections.length; i+=1){
        if (this.connections[i].userID === userID){
          return true;
        }
      }
      return false;
    }
    const userID = findID();
    if (userID === "")
      return ;

    if (findClient(userID) === false){
      const room: PrivateRoom | Room | null= this.rooms.findPlayerInAllRooms(userID);
      if (room){
		if (room.playerA === userID)
			this.server.emit(`LeaveGame${room.roomnbr}`, "A");
		else if (room.playerB === userID)
			this.server.emit(`LeaveGame${room.roomnbr}`, "B");
        if (room.game.length > 0 && room.playerAReady && room.playerBReady){
            room.game[0].killGame(userID);
            room.playerAReady = false;
            room.playerBReady = false;
            if (room.historySaved == false && (room.playerA !== null && room.playerB !== null)) {
              room.historySaved = true;
              if (userID == room.playerA)
                this.gameHistoryService.saveGameHistory(room.level, +room.playerA, +room.playerB, 0, 1);
              else
                this.gameHistoryService.saveGameHistory(room.level, +room.playerA, +room.playerB, 1, 0);
            }
            room.playerAReady = false;
            room.playerBReady = false;
        }
		if (room.historySaved === false)
			await this.asyncTimeout(2000);
        this.rooms.rmPublicPlayer(room.roomnbr, userID);
        this.rooms.leavePrivateRoom(room.roomnbr, userID);
        this.status.removeStatusInGame(userID);
      }
    }
  }

//the game should have separate heartbeat function than online and offline status

@SubscribeMessage('GameHeartbeat')
  handleHeartBeatMessage(client:Socket){
    const room = this.rooms.findPlayerInAllRooms(client['userId'].toString());
    const stat = room.getStat();
    this.heartbeat.handleHeartBeat(client, client['userId'].toString(), stat);
    }

//this function stores the clientID coupled to userID
//disconnect the socket in case there is timeout
//only kill the game if all clients have been killed
  @SubscribeMessage('userID')
  @UsePipes(new ValidationPipe({transform: true}))
    addConnection(client:Socket, payload:GamePayload){
      console.log('Connection userID received');
      this.connections.push({client:client.id, userID:payload.userID});
      let room:Room|PrivateRoom = this.rooms.getPublicRoom(payload.roomnbr);
      let stat = 0;
      let scoreA = 0;
      let scoreB = 0;
      if (!room)
        room = this.rooms.getPrivateRoom(payload.roomnbr);
      if (room){
        stat = room.getStat();
        scoreA = room.getScore(room.playerA);
        scoreB = room.getScore(room.playerB);
      }
      client.emit("GameInfo", {stat:stat, scoreA:scoreA, scoreB:scoreB});
      console.log("GameInfo passed.");
    }

  @WebSocketServer()
    server:Server;

  @SubscribeMessage('ArrowDown')
  @UsePipes(new ValidationPipe({transform: true}))
    ArrowUpA(client:Socket, payload: GamePayload): void {
    let room: Room | PrivateRoom | null= this.rooms.findPlayerInAllRooms(payload.userID);
    if (room === null)
      return;
    if (room.playerA === payload.userID){
      room.game[0].incrementPaddleA();
    }
    if (room.playerB === payload.userID){
      room.game[0].incrementPaddleB();
    }
    }
  
  @SubscribeMessage('ArrowUp')
  @UsePipes(new ValidationPipe({transform: true}))
    ArrowDownA(client:Socket, payload: GamePayload): void {
      let room: Room | PrivateRoom | null= this.rooms.findPlayerInAllRooms(payload.userID);
      if (room === null || room.game.length === 0)
        return;
      if (room.playerA === payload.userID){
        room.game[0].decrementPaddleA();
      }
      if (room.playerB === payload.userID){
        room.game[0].decrementPaddleB();
      }
    }

  @SubscribeMessage('JoinRoom')
  @UsePipes(new ValidationPipe({transform: true}))
    async joinRoom(client:Socket, payload:GamePayload) {
      console.log(`Player ${payload.userID} decided to join room ${payload.roomnbr}`);
      //regularly sends back player data so the player can see the other player
            //check if room is valid:
            //check if room is public or private
      const room: Room | PrivateRoom | null =  this.rooms.findRoomWithRoomnbr(payload.roomnbr); 
      if (room === null){
        console.log('no room found');
        client.emit(`valid`, false);
        return ;
      }
      try{
        if (room instanceof PrivateRoom) {
          if(payload.userID !== room.playerA && payload.userID !== room.playerB){
            console.log(payload.userID, room.playerA, room.playerB)
            client.emit('privateRoom');
            return;
          }
        }
        else if (room instanceof Room)
          this.rooms.joinPublicRoom(room.roomnbr, payload.userID);
      }
      catch{
        client.emit(`RoomFull`);
      }
      client.emit("roomlevel", room.getRoomLevel());
      //here check in database the real names of players;
      let playerA: string;
      let playerB: string;
      if (room.playerA)
        playerA = (await this.usersService.findById(Number(room.playerA))).username
      if (room.playerB)
        playerB = (await this.usersService.findById(Number(room.playerB))).username      
        
        this.server.emit(`players${room.roomnbr}`, {playerA, playerB});
      }

  @SubscribeMessage('start') //now should settle player A or player B
  @UsePipes(new ValidationPipe({transform: true}))
    GameStart(client:Socket, payload: GamePayload): void {
      console.log('start message received. Roomnumber: ', payload.roomnbr,
      "player:", payload.userID);
      let interval:NodeJS.Timeout;

      //------------first check if there is allready a game 
      const room:Room | PrivateRoom = this.rooms.findPlayerInAllRooms(payload.userID);
      const game:(Game | GameHard)[] = room.game;
      
      if (payload.userID === room.playerA)
        room.playerAReady = true;
      else if (payload.userID === room.playerB)
        room.playerBReady = true;

      //------------ if there is no game
      if (room.playerAReady && room.playerBReady){
        room.addGame(payload.roomnbr, room);
        game[0].gameStart();
      } else {
        return;
      }

      room.historySaved = false;
      this.server.emit(`gamestat${payload.roomnbr}`, game[0].getStat());
      interval = setInterval(async () =>{
        if (game[0].getStat() === 2)
          this.server.emit(`GameVar${payload.roomnbr}`, game[0].getGV());
        else if (game[0].getStat() === 3){
          room.playerAReady = false;
          room.playerBReady = false;
          console.log('game over');
          this.server.emit(`gamestat${payload.roomnbr}`, 3);
          clearInterval(interval);
          await this.asyncTimeout(2000);
          game.splice(0, 1);
          const scoreA = room.getScore(room.playerA);
          const scoreB = room.getScore(room.playerB);
          console.log("scores: ", scoreA, " ", scoreB);
          this.server.emit(`score${payload.roomnbr}`, {scoreA, scoreB});
          this.server.emit(`gamestat${payload.roomnbr}`, 0);
          let winner = room.getWinner();
          if (winner === "A") {this.rankingService.increaseScore(+room.playerA, 1)}
            else {this.rankingService.increaseScore(+room.playerB, 1)}
          //record the outcome in the database
          if (room.historySaved == false){
			room.historySaved = true;
			if (winner === "A") {this.gameHistoryService.saveGameHistory(room.level, +room.playerA, +room.playerB, 1, 0)}
              else {this.gameHistoryService.saveGameHistory(room.level, +room.playerA, +room.playerB, 0, 1)}
		    }

          //reset the scores before starting another game probably
          }
      }, 50);
    }
}
