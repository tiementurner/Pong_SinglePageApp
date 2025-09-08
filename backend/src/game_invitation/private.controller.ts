import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RoomInfo } from '../game/GameResources';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { CreateRoomDto } from 'src/game/room.controller';

@Controller()
export class PrivateController {
    constructor(private readonly rooms:RoomInfo){};

    @Post('createprivateroom')
    @UseGuards(AuthenticationGuard)
    createPrivate(@Body() requestData: CreateRoomDto): number{
      console.log('create private room request');
      const {userID, level} = requestData;
      const roomnbr: number = this.rooms.createPrivateRoom(userID, level);
      return roomnbr;
    }
}
