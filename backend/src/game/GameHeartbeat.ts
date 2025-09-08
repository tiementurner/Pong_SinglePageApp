import { Socket } from 'socket.io';
import { Server } from 'http';
import { Injectable } from '@nestjs/common';
import { Room } from 'src/game/room.classes';
import { RoomInfo } from './GameResources';
import { PrivateRoom } from 'src/game/GamePrivate';
import { Status } from 'src/status/Status';

//the Hearbeat function test if someone has bad connection
//in case of bad connection(no heartbeat for longer than 6 second, disconnect client)
//in case someone is disconnected, count that as a loose
//disconnect the client if too long timeout
//this is also shared resource
//two functions:
//first: manage the case someone has bad connection, if no heartbeat for longer than a period, loose the game
//second: manage the socket connection, if too long no connection, disconnect the socket

const INACTIVE_TIMEOUT = 6100;

@Injectable()
export class GameHeartbeat {

    private userLastActivity: Map<string, number> = new Map(); //last heartbeat for the user
    private connections: Map<string, [string, Socket, number]> = new Map(); //sockets and userID's, sockets, lastActivity

    handleHeartBeat(client:Socket, userID:string, stat:number){
        this.connections.set(client.id, [userID, client, Date.now()]);
        this.userLastActivity.set(userID, Date.now());
        this.status.setStatusInGame(userID);
        //send pulse to frontend
        // console.log('GamePulse sent');
        client.emit('GamePulse', stat);
    }


    //each connection should be managed separately. send pulse in interval
    //socket has no connection, then kill the socket 
    //all connections of one user should be managed collectively.
    //user has no connection then kill the game
    constructor(private readonly rooms: RoomInfo, private readonly status: Status){
        setInterval(()=>{
            //collective mangement of user
            const time = Date.now();
            for (let[userID, lastActive] of this.userLastActivity.entries()){
                if (time - lastActive > INACTIVE_TIMEOUT) {
                    const room: Room | PrivateRoom | null = this.rooms.findPlayerInAllRooms(userID);
                    if (room){
                        if (room.game.length > 0){
                            room.game[0].killGame(userID);
                            this.status.removeStatusInGame(userID);
                        }
                    }
                    this.userLastActivity.delete(userID);
                }
            }
            for (let[clientID, [userID, client, lastActive]] of this.connections.entries()){
                if (time - lastActive > INACTIVE_TIMEOUT){
                    client.disconnect(true);
                    this.connections.delete(clientID);
                }
            }
        }, 3000);
    }
}