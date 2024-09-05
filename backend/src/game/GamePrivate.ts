import { Room } from 'src/game/room.classes'


//the private game should exist at least 1 hour from the moment it is made. 
//after that, handle error, give back message that the room timed out
//the room shouldn't be closed if none is in the room

export class PrivateRoom extends Room {
    private creationTime:number;
    private playerAJoined: boolean = false;
    private playerBJoined: boolean = false;

    constructor(userID:string, level:number){
        super (userID, level);
        this.creationTime = Date.now();
        this.playerAJoined = true;
    }

    public getCreationTime():number{
        return this.creationTime;
    }

    public playerAJoin(): void {
        this.playerAJoined = true;
    }

    public playerALeave():void {
        this.playerAJoined = false;
    }

    
    public playerBJoin():void {
        this.playerBJoined = true;
    }

    
    public playerBLeave():void {
        this.playerBJoined = false;
    }

    public isEmpty():boolean {
        if (this.playerAJoined === false && this.playerBJoined === false)
            return true;
        return false
    }
}
