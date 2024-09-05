import { Injectable } from '@nestjs/common'
import {Room} from 'src/game/room.classes'
import { PrivateRoom } from 'src/game/GamePrivate';


@Injectable()
export class RoomInfo{
    private rooms:Room[]=[];
    private privateRooms:PrivateRoom[]=[];
    private expiration:number = 3600000; //one hour
    constructor(){
        setInterval(()=>{
            this.checkTime();
        }, 1000);
    }

    //-------private rooms---------
    public createPrivateRoom(userID:string, level:number):number{
        const room = new PrivateRoom(userID, level);
        
        this.privateRooms.push(room);
        return room.roomnbr;
    }

    public getPrivateRoom(roomnbr:number):PrivateRoom {
        for (let i = 0; i < this.privateRooms.length; i++){
            if (this.privateRooms[i].roomnbr === roomnbr)
                return(this.privateRooms[i]);
        }
        return null;
    }
   
    public getPrivateRooms(userID: string):PrivateRoom[] {

        let privateRoomsFromUser : PrivateRoom[] = [];
        for (let i = 0; i < this.privateRooms.length; i++){
            if (this.privateRooms[i].playerA == userID || this.privateRooms[i].playerB == userID)
                privateRoomsFromUser.push(this.privateRooms[i]);
        }
        return privateRoomsFromUser;
    }

    public checkTime():void{
        const now = Date.now();
        for (let i = 0; i < this.privateRooms.length; i++){
            if (now - this.privateRooms[i].getCreationTime() > this.expiration){
                this.privateRooms.splice(i, 1);
            }
        }
    }

    public findPrivateRoom(roomnbr:number){
        return(this.privateRooms.findIndex(elem=>elem.roomnbr===roomnbr));
    }

    public joinPrivateRoom(roomnbr: number, userID:string): boolean{
        const room: PrivateRoom = this.getPrivateRoom(roomnbr);
        if (room){
            if (room.playerA === userID){
                room.playerB = userID;
                room.playerAJoin();
                return true;
            }
            if (room.playerB === null){
                room.playerB = userID;
                room.playerBJoin()
                return true;
            }
            else 
                return false;
        }
        return false;
    }

    public leavePrivateRoom(roomnbr:number, userID:string):void{
        const room: PrivateRoom = this.getPrivateRoom(roomnbr);
        if (room){
            if (room.playerA === userID)
                room.playerALeave();
            if (room.playerB === userID)
                room.playerBLeave();
            if (room.isEmpty())
                this.rmPrivateRoom(room.roomnbr);
        }

    }

    public rmPrivateRoom(nbr:number){
        this.privateRooms.splice(this.rooms.findIndex(elem=>elem.roomnbr===nbr),1);
    }

    public findPlayerInPrivateRoom(userID:string):Room|null{
        for (let i=0; i < this.privateRooms.length; i+=1){
            if (this.privateRooms[i].playerA === userID || this.privateRooms[i].playerB === userID){
                return this.privateRooms[i];
            }
        }
        return null;
    }

    //--------------public rooms------------------
    public getPublicRooms(): Room[]{
        return this.rooms;
    }

    public addPublicRoom(room:Room){
        this.rooms.push(room);
    }

    public rmPublicRoom(nbr:number){
        this.rooms.splice(this.rooms.findIndex(elem=>elem.roomnbr===nbr),1);
    }

    public inPublicRoom(userID:string):boolean{
        if (this.rooms.findIndex(elem=>(elem.playerA===userID || elem.playerB===userID))>=0)
            return (true);
        return false;
    }

    public findPublicRoom(roomnbr:number){
        return(this.rooms.findIndex(elem=>elem.roomnbr===roomnbr));
    }

    public findPlayerInPublicRoom(userID:string):Room|null{
        for (let i=0; i < this.rooms.length; i+=1){
            if (this.rooms[i].playerA === userID || this.rooms[i].playerB === userID){
                return this.rooms[i];
            }
        }
        return null;
    }

    public joinPublicRoom(roomnbr:number, userID:string):void{
        const room = this.getPublicRoom(roomnbr);
        if (!room)
            throw Error('Room not found.');
        if (room.playerA === userID || room.playerB === userID){
            return ;
        }
        else if (room.playerA === null)
            room.playerA = userID;
        else if (room.playerB ===null)
            room.playerB = userID;
        else
            throw Error('Room allready full.');
    }

    public findEmptyPublic():Room|null{
        for (let i = 0; i < this.rooms.length; i+=1){
            if (this.rooms[i].playerA === null || this.rooms[i].playerB === null){
                return this.rooms[i];
            }
        }
        return null;
    }

    public rmPublicPlayer(roomnbr:number, userID:string):void{
        const index = this.findPublicRoom(roomnbr);
        if (index === -1)
            return ;
        if (this.rooms[index].playerA === userID)
            this.rooms[index].playerA = null;
        if (this.rooms[index].playerB === userID)
            this.rooms[index].playerB = null;
        if (this.rooms[index].playerA == null && this.rooms[index].playerB == null){
            this.rooms.splice(index, 1);
        }
    }

    public getPublicRoom(roomnbr:number):Room{
        const index = this.findPublicRoom(roomnbr);
        if (index === -1)
            return null;
        else
            return (this.rooms[index]);
    }

//--------------combined functions-------------------

    public findPlayerInAllRooms(userID: string):Room|PrivateRoom|null{
        let room: Room | PrivateRoom | null = this.findPlayerInPublicRoom(userID);
        if (!room){
            room = this.findPlayerInPrivateRoom(userID);
        }
        return room;
    }
    
    public findRoomWithRoomnbr(roomnbr:number):Room|PrivateRoom|null{
        let room: Room | PrivateRoom | null = this.getPublicRoom(roomnbr);
        if (room === null){
            console.log("no public room found")
            return this.getPrivateRoom(roomnbr);
        }
        return room;
    }

}