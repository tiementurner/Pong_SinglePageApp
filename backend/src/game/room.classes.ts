import {Game} from 'src/game/GameEasy'
import { GameHard } from './GameHard';

export class Room {
    playerA:string = null;
    playerB:string = null;
    roomnbr:number;
    scores:Map<string, number>= new Map();
    winner:string = null;
    game:(Game|GameHard)[]=[];
    level:number;
    playerAReady: boolean = false;
    playerBReady: boolean = false;
    historySaved : boolean = false;
    
    constructor(userID:string, level:number){
        this.playerA = userID;
        this.roomnbr = Date.now();
        this.level=level;
    }
    
    public getStat():number{
        if (this.game.length === 0)
            return (0);
        else
            return(this.game[0].getStat());
    }

    private changeScore(userID:string, score:number){
        const existingScore = this.scores.get(userID);
        if (existingScore === undefined){
            this.scores.set(userID, score)
        }
        else {
            this.scores.set(userID, existingScore + score);
        }
    }

    public setScore(win:string):void{
        this.winner = win;
        if (this.level === 1){
            if (win === "A"){
                this.changeScore(this.playerA, 1);
                this.changeScore(this.playerB, -1);
            }
            if (win === "B"){
                this.changeScore(this.playerA, -1);
                this.changeScore(this.playerB, 1);
            }
        }
        else if (this.level === 2){
            if (win === "A"){
                this.changeScore(this.playerA, 2);
                this.changeScore(this.playerB, -2);
            }
            if (win === "B"){
                this.changeScore(this.playerA, -2);
                this.changeScore(this.playerB, 2);
            }
        }

    }

    public getScore(userID:string):number{
        const existingScore = this.scores.get(userID);
        if (existingScore)
            return (existingScore);
        return 0;
    }

    public getWinner(){
        return this.winner;
    }

    public getRoomLevel():number{
        return this.level;
    }

    public addGame(roomnbr:number, room:Room):void{
        if (room.level === 1){
            this.game.push(new Game(roomnbr, room));
        }
        else if (room.level === 2){
            this.game.push(new GameHard(roomnbr, room));
        }
    }
}