import { Injectable } from '@nestjs/common';
import { Room } from 'src/game/room.classes';
import { RoomInfo } from 'src/game/GameResources';
import { PrivateRoom } from './GamePrivate';

@Injectable()
export class RoomService {
  constructor(private readonly rooms:RoomInfo){};

  getPublicRoomsForRequest(): Room[] {
    return(this.rooms.getPublicRooms());
  }

  getPrivateRoomsForRequest(userID: string): PrivateRoom[] {
    return (this.rooms.getPrivateRooms(userID));
  }

  joinPublicRoom(userID:string, roomnbr:number):boolean{
    if (this.rooms.inPublicRoom(userID)===false)
    {
      this.rooms.joinPublicRoom(roomnbr, userID);
      return true;
    }
    else
      return false;
  }

  createPublicRoom(userID:string, level:number):number{
    if (this.rooms.inPublicRoom(userID)===false){
      const newRoom:Room = new Room(userID, level);
      this.rooms.addPublicRoom(newRoom);
      return newRoom.roomnbr;
    }
    return this.rooms.findPlayerInPublicRoom(userID).roomnbr;
  }
  
  randomJoinRoom(userID:string){
    const room:Room|null = this.rooms.findEmptyPublic();
    if (room != null)
    {
      console.log(`Room ${room.roomnbr} has been found.`)
      this.joinPublicRoom(userID, room.roomnbr);
    }
    else
    {
      this.createPublicRoom(userID, 1);
    }
  }

  getPlayer(userID:string, roomnbr:number):string{
    const room:Room = this.rooms[this.rooms.findPublicRoom(roomnbr)];
    if (room.playerA === userID)
      return ("A");
    else 
      return ("B");
  }

  checkPublicRoom(roomnbr:number):boolean{
    const rooms:Room[] = this.getPublicRoomsForRequest();
    rooms.forEach(room => {
      if (room.roomnbr = roomnbr)
        return true;
    });
    return false;
  }

  findPublicRoom(roomnbr:number):Room{
    const room:Room = this.rooms[this.rooms.findPublicRoom(roomnbr)];
    return (room);
  }
}