import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { User } from 'src/users/users.entity';
import { getUser } from 'src/users/user.decorator';
import { RoomInfo } from './GameResources';
import { UsersService } from 'src/users/users.service';
import { IsAlphanumeric, IsNumber, IsString } from 'class-validator';

export class RoomData {
  @IsAlphanumeric()
  userID: string;

  @IsNumber()
  roomnbr: number;
}

export class CreateRoomDto {
  @IsAlphanumeric()
  userID: string;

  @IsNumber()
  level: number;
}

export class Challenge {
  @IsAlphanumeric()
  challengerID: string;

  @IsNumber()
  level: number;
}

//here to arrange what to requests to handle
@Controller()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly rooms: RoomInfo,
    private readonly usersService: UsersService
  ) {}

//we have to add @UseGuard(AuthenticationGuard) and @getUser()
  //to these routes when all testing with postman is done.

  @Get('rooms')
  @UseGuards(AuthenticationGuard)
  async getList(){
    //console.log('get rooms request');
    const rooms = this.roomService.getPublicRoomsForRequest();
    const filteredRooms = await Promise.all(rooms.map(async (room: any) => {
      const roomCopy = { ...room };
      delete roomCopy.game;
      if (room.playerA)
        roomCopy.usernameA = (await this.usersService.findById(room.playerA)).username
      else
        roomCopy.usernameA = null;
      if (room.playerB)
        roomCopy.usernameB = (await this.usersService.findById(room.playerB)).username
      else
        roomCopy.usernameB = null;
      roomCopy.isPrivate = false;
      return roomCopy;
    }));
    return filteredRooms;
  }
  
  @Get('privaterooms')
  @UseGuards(AuthenticationGuard)
  async getprivateList(
    @getUser()user : User
  ){
    //console.log('get private rooms request');
    const rooms = this.roomService.getPrivateRoomsForRequest(user.id.toString());
    const filteredRooms = await Promise.all(rooms.map(async (room: any) => {
      const roomCopy = { ...room };
      delete roomCopy.game;
      if (room.playerA)
        roomCopy.usernameA = (await this.usersService.findById(room.playerA)).username
      else
        roomCopy.usernameA = null;
      if (room.playerB)
        roomCopy.usernameB = (await this.usersService.findById(room.playerB)).username
      else
        roomCopy.usernameB = null;      
      roomCopy.isPrivate = true;
      return roomCopy;
    }));
    return filteredRooms;
  }

  @Post('join')
  @UseGuards(AuthenticationGuard)
  join(
    @Body() requestData: RoomData,
    @getUser() user: User
  ){
    const {userID, roomnbr }= requestData;
    if (this.roomService.joinPublicRoom(userID, roomnbr)=== true)
      return (this.roomService.getPlayer(userID, roomnbr));
    else 
      return (null);
  }

  @Post('create')
  @UseGuards(AuthenticationGuard)
  create(
    @Body() requestData: CreateRoomDto,
    @getUser() user: User
  ){
    const {userID, level} = requestData;
    this.roomService.createPublicRoom(userID, level);
    return (1);
  }

  @Post('randomjoin')
  @UseGuards(AuthenticationGuard)
  randomJoin(
    @getUser() user: User
  ){
    this.roomService.randomJoinRoom(user.id.toString());
    return (true);
  }

  // @Post('checkroom')
  // @UseGuards(AuthenticationGuard)
  // checkroom(@Body() requestData:{roomnbr:string}){
  //   console.log('checkroom request');
  //   const data = +requestData;
  //   return (this.roomService.checkPublicRoom(data));
  // }


  @Post('challengematch')
  @UseGuards(AuthenticationGuard)
  challengeMatch(
    @getUser() user: User,
    @Body() requestData: Challenge
  ) {
    const challengerID = requestData.challengerID;

    const newRoomNbr = this.rooms.createPrivateRoom(user.id.toString(), requestData.level);
    this.rooms.joinPrivateRoom(newRoomNbr, challengerID)
    return ;
  }


}
