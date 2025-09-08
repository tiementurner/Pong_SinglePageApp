import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

const INACTIVE_TIMEOUT = 10000;

@Injectable()
export class Status {

    private userLastActivity: Map<string, number> = new Map(); // userID to last activity timestamp
    private userClient: Map<string, string> = new Map(); // clientID to userID
    private allSockets: Map<string, Socket> = new Map(); // clientID to Socket
    private userInGame: Set<string> = new Set(); // Set of userIDs in game
    private userInChat: Set<string> = new Set(); // Set of userIDs in chat

    constructor(){
        this.checkConnection();
    }

    findID(clientID: string | undefined): string | undefined {
        return this.userClient.get(clientID);
    }

    addConnection(client: Socket, userID: string): void {
        this.userClient.set(client.id, userID);
        this.allSockets.set(client.id, client);
        this.userLastActivity.set(userID, Date.now());
    }

    updateStatus(userID:string, activity:boolean){
		// console.log("userId: ", userID);
		// console.log("Actvity: ", activity);
        if (activity ===  true){
            this.userLastActivity.set(userID, Date.now());
        }
    }

    private checkConnection(){
        const intervalID = setInterval(()=>{
            for (const [key, value] of this.userLastActivity){
                if (Date.now() - value > INACTIVE_TIMEOUT){
                    this.userLastActivity.delete(key);
                    for (let [k, v] of this.userClient){
                        if (v === key){
                            if (this.allSockets[k]) {
                                this.allSockets[k].disconnect(true);
                                this.allSockets.delete(k);
                                this.userClient.delete(k);
                            }
                        }
                    }
                }
            }
        }, 1000);
    }

    private userHasConnection(userID: string): boolean {
        for (const ID of this.userClient.values()){
            const strID = ID.toString();
            if (userID === strID){
                // console.log("user does have connection", strID);
                return true;
            }
        }
        // console.log("user does not have connection")
        return false;
    }

    removeClient(clientID:string){
        this.allSockets.delete(clientID);
        this.userClient.delete(clientID);
    }

    setStatusInGame(userID: string): void {
        this.userInGame.add(userID);
    }

    removeStatusInGame(userID: string): void {
        this.userInGame.delete(userID);
    }

    setStatusInChat(userID: string): void {
        
        this.userInChat.add(userID);
    }

    removeStatusInChat(userID: string): void {
        this.userInChat.delete(userID);
    }

    private userNotTimeout(userID:string):boolean{
        if (Date.now() - this.userLastActivity.get(userID) < INACTIVE_TIMEOUT){
            // console.log("not timeout");
            return true;
        }
        // console.log("timeout");
        return false;
    }

    private checkUserLastActivity(userID:string){
        // console.log(this.userLastActivity);
        if (this.userLastActivity.has(userID)){
            // console.log("user last activity does have userID", userID);
            return true;
        }
        // console.log("user last activity does not have userID", userID);
        return false;
    }

    getMyStatus(userID: string): string {
        const now = Date.now();
        if (this.userInGame.has(userID)) {
            return "InGame";
        } else if (this.userInChat.has(userID)) {
            return "InChat";
        } else if (this.checkUserLastActivity(userID) && 
        this.userHasConnection(userID) &&
        this.userNotTimeout(userID)) {
            return "Online";
        } else if (this.userHasConnection(userID)) {
            return "Away";
        }
        return "Offline";
    }

    getFriendStatus(userID: string): string {
        return this.getMyStatus(userID);
    }
}
