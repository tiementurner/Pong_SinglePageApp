import {Set1} from './GameParameters';
import {Par, Coordinate} from './GameClasses';
import { Room } from './room.classes';
import { PrivateRoom } from './GamePrivate';

export class GameVar {
    paddleA:number;
    paddleB:number;
    ball:Coordinate;
    
    constructor(paddleA:number, paddleB:number, ball:Coordinate){
        this.paddleA = paddleA;
        this.paddleB = paddleB;
        this.ball = ball;
    }
};

export class Vector{
    x:number;
    y:number;
    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}

export function randomDirection():number{
    if (Math.random()<0.5)
        return -1;
    else
        return 1;
}


export class Game {
    protected GP:Par = new Par(Set1);
    protected GV:GameVar = new GameVar(
        (this.GP.fieldHeight-this.GP.paddleHeight)/2,
        (this.GP.fieldHeight-this.GP.paddleHeight)/2,
        new Coordinate(this.GP.fieldWidth/2, this.GP.fieldHeight/2)
    );
    protected interval:NodeJS.Timeout;
    protected vector = new Vector(randomDirection()*this.GP.ballSpeed, 0);
    protected roomnbr:number;
    protected gameStat:number;
    protected playerAReady = false;
    protected playerBReady = false;
    protected gameScore:string = null;

    constructor(roomnbr:number, protected readonly room:Room|PrivateRoom, gamePar:Par=new Par(Set1)){
        this.roomnbr = roomnbr;
        this.gameStat = 0;
        this.GP = gamePar
    }

	protected remapVector(side: number, paddleY: number) {
        let hitposition = this.GV.ball.y - paddleY

        let normalized_hitPosition = hitposition / (this.GP.paddleHeight / 2)

        normalized_hitPosition = Math.max(-1, Math.min(1, normalized_hitPosition))

        let deflectionAngle = normalized_hitPosition * (40 * Math.PI / 180)

        let currentAngle = Math.atan2(this.vector.y, this.vector.x);

        let newAngle ;
        if (side === 1) {
            newAngle = Math.PI - currentAngle + deflectionAngle;
        } else if (side === -1) {
            newAngle = Math.PI + currentAngle + deflectionAngle;
        }

        let speed = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y)

        this.vector.x = speed * Math.cos(newAngle) * side;
        this.vector.y = speed * Math.sin(newAngle) * side;

        if (side === 1 && this.vector.x < 5)
            this.vector.x = 5
        else if (side === -1 && this.vector.x > -5)
            this.vector.x = -5
    }

	
	
    protected collision():number{
        //collision with gateA:
        if (this.GV.ball.x - this.GP.ballRadius <= (-1) * this.GP.gateDepth && 
            this.GV.ball.y + this.GP.ballRadius < (this.GP.fieldHeight + this.GP.gateWidth) / 2 &&
            this.GV.ball.y - this.GP.ballRadius > (this.GP.fieldHeight - this.GP.gateWidth) / 2 ||
            this.GV.ball.x + this.GP.ballRadius < 0)
            return (-1);
        //collision with gateB:
        if (this.GV.ball.x + this.GP.ballRadius >= this.GP.fieldWidth + this.GP.gateDepth && 
            this.GV.ball.y + this.GP.ballRadius < (this.GP.fieldHeight + this.GP.gateWidth) / 2 &&
            this.GV.ball.y - this.GP.ballRadius > (this.GP.fieldHeight - this.GP.gateWidth) / 2 ||
            this.GV.ball.x - this.GP.ballRadius > this.GP.fieldWidth)
            return (-2);
        //collision with upper and lower boundary
        if ((this.GV.ball.y + this.GP.ballRadius >= this.GP.fieldHeight)||
        ((this.GV.ball.y - this.GP.ballRadius <= 0))){
            this.vector.y *= -1;
        }
        //collission with side boundaries
        if (this.room.level === 1){
            if ((this.GV.ball.x + this.GP.ballRadius >= this.GP.fieldWidth||
            this.GV.ball.x - this.GP.ballRadius <= 0) && 
            (this.GV.ball.y - this.GP.ballRadius > (this.GP.fieldHeight + this.GP.gateWidth)/2 ||
            this.GV.ball.y + this.GP.ballRadius < (this.GP.fieldHeight - this.GP.gateWidth)/2)){
                this.vector.x *= -1
            }
        }
        //collision with left gate sides:
        // if ((this.GV.ball.x-this.GP.ballRadius<=0 && this.GV.ball.y-this.GP.ballRadius<= (this.GP.fieldHeight-this.GP.gateWidth)/2) ||
        // (this.GV.ball.x-this.GP.ballRadius<=0 && this.GV.ball.y+this.GP.ballRadius>= (this.GP.fieldHeight+this.GP.gateWidth)/2) ||
        // (this.GV.ball.x+this.GP.ballRadius>=this.GP.fieldWidth && this.GV.ball.y-this.GP.ballRadius<= (this.GP.fieldHeight-this.GP.gateWidth)/2) ||
        // (this.GV.ball.x+this.GP.ballRadius>=this.GP.fieldWidth && this.GV.ball.y+this.GP.ballRadius>= (this.GP.fieldHeight+this.GP.gateWidth)/2)){
        //     this.vector.y *= -1;
        //     console.log("HIT")
        // }
		if (
			this.GV.ball.x - this.GP.ballRadius <= this.GP.paddleWidth + this.GP.paddleOffset &&
			this.GV.ball.x - this.GP.ballRadius >= this.GP.paddleOffset &&
			this.GV.ball.y - this.GP.ballRadius <= this.GV.paddleA + this.GP.paddleHeight &&
			this.GV.ball.y + this.GP.ballRadius >= this.GV.paddleA &&
			this.vector.x < 0
		) { 
			this.remapVector(1, this.GV.paddleA + this.GP.paddleHeight / 2); // Pass 1 for paddleA
		}
		
		// Collision with paddleB side
		if (
			this.GV.ball.x + this.GP.ballRadius >= this.GP.fieldWidth - this.GP.paddleWidth - this.GP.paddleOffset &&
			this.GV.ball.x + this.GP.ballRadius <= this.GP.fieldWidth - this.GP.paddleOffset &&
			this.GV.ball.y - this.GP.ballRadius <= this.GV.paddleB + this.GP.paddleHeight &&
			this.GV.ball.y + this.GP.ballRadius >= this.GV.paddleB &&
			this.vector.x > 0
		) {
			this.remapVector(-1, this.GV.paddleB + this.GP.paddleHeight / 2); // Pass -1 for paddleB
		}

        //might have to delete
        //collision with sides of paddleA
        if (this.GV.ball.x + this.GP.ballRadius <= this.GP.paddleOffset + this.GP.paddleWidth &&
            this.GV.ball.x - this.GP.ballRadius >= this.GP.paddleOffset &&
            this.GV.ball.y + this.GP.ballRadius >= this.GV.paddleA &&
            this.GV.ball.y - this.GP.ballRadius <= this.GV.paddleA + this.GP.paddleHeight
        )
            this.vector.y*=-1;
        //collision with sides of paddleB
        if (
            this.GV.ball.x + this.GP.ballRadius >= this.GP.fieldWidth - this.GP.paddleOffset && 
            this.GV.ball.x + this.GP.ballRadius <= this.GP.fieldWidth - this.GP.paddleOffset - this.GP.paddleWidth &&
            this.GV.ball.y + this.GP.ballRadius >= this.GV.paddleB && 
            this.GV.ball.y - this.GP.ballRadius <= this.GV.paddleB + this.GP.paddleHeight
        )
            this.vector.y*=-1;
        return 1;
    }


    //move the ball with a vector, this function will be executed using interval
    //first need to check the collision with any side of the field
    protected moveBall():number{
        const stat:number = this.collision();
        if (stat < 0)
            return (stat);
        this.GV.ball.x+=this.vector.x;
        this.GV.ball.y+=this.vector.y;
        return (1);
    }

    public gameStart():void{
        // if (this.playerAReady === true && this.playerBReady ===true)
        // {
            this.gameStat = 2;
            console.log("Game started");
            this.interval = setInterval(() =>{
            const win = this.moveBall();
            if (this.gameStat === 3){
                clearInterval(this.interval);
                return ;
            }
            if (win < 0){
                if (win === -1){
                    console.log('playerB win');
                    this.gameScore = "B";
                }else{ 
                    console.log('playerA win');
                    this.gameScore = "A";
                }
                this.gameStat = 3;
                clearInterval(this.interval);
                this.room.setScore(this.gameScore);
                return ;
            }
            }, 50);
        //}
    }

    public incrementPaddleA():void{
        if (this.GV.paddleA < this.GP.fieldHeight-this.GP.paddleHeight)
            this.GV.paddleA+=this.GP.paddleSpeed;
    }

    public decrementPaddleA():void{
        if (this.GV.paddleA > 0)
            this.GV.paddleA-=this.GP.paddleSpeed;
    }

    public incrementPaddleB():void{
        if (this.GV.paddleB < this.GP.fieldHeight-this.GP.paddleHeight)
            this.GV.paddleB+=this.GP.paddleSpeed;
    }

    public decrementPaddleB():void{
        if (this.GV.paddleB > 0)
            this.GV.paddleB-=this.GP.paddleSpeed;
    }

    public getGV():GameVar{
        return (this.GV);
    }

    public getStat(){
        return(this.gameStat);
    }
    
    public readyPlayerA(){
        this.playerAReady = true;
    }

    public readyPlayerB(){
        this.playerBReady = true;
    }

    public isReadyPlayerA(){
        return this.playerAReady;
    }

    public isReadyPlayerB(){
        return this.playerBReady;
    }

    public getScore(){
        return (this.gameScore);
    }

    public killGame(userID:string){
        this.gameStat = 3;
        if (this.room.playerA === userID){
            this.gameScore = 'B';
        }
        else{
            this.gameScore = 'A';
        }
        this.room.setScore(this.gameScore);
    }
}

