import {AdditionalParameter, Set2, Set2Add} from './GameParameters';
import {Par, Coordinate, AddPar} from './GameClasses';
import { Room } from './room.classes';
import { Game } from './GameEasy'
import { clearInterval } from 'timers';
import { PrivateRoom } from './GamePrivate';


export class Block {
    upperLeft:Coordinate;
    upperRight:Coordinate;
    lowerLeft:Coordinate;
    lowerRight:Coordinate;
    constructor(width:number, height:number, x:number, y:number){
        this.upperLeft = new Coordinate(x-width/2, y - height/2);
        this.upperRight = new Coordinate(x+width/2, y -height/2);
        this.lowerLeft = new Coordinate(x-width/2, y+height/2);
        this.lowerRight = new Coordinate(x + width/2, y+height/2);
    }
}

export class GameHard extends Game {
    protected acceleration:number;
    protected setAdd: AdditionalParameter;
    protected blocks:Block[] = [];
    protected lastCollisionTime: number = 0;
    protected collisionCooldown: number = 50;

    constructor(roomnbr:number, protected room:Room|PrivateRoom, gamePar = new Par(Set2), addPar = new AddPar(Set2Add)){
        super(roomnbr, room, gamePar);
        this.acceleration = 1.001;
        this.generateBlocks(addPar.middleBlocks, addPar.fieldBlocks, addPar.blockWidth, addPar.blockHeight);
    }

    private generateBlocks(middle:number, field:number, width:number, height:number){
        for (let i = 0; i < middle; i += 1){
            this.blocks.push(new Block(width, height, this.GP.fieldWidth/2, 
            (i + 1)* this.GP.fieldHeight/(middle+1)));
        }
        for (let i = 0; i < field; i += 1){
            this.blocks.push(new Block(width, height, this.GP.fieldWidth/4, 
            (i + 1)*(this.GP.fieldHeight/(field + 1))));
        }
        for (let i = 0; i < field; i += 1){
            this.blocks.push(new Block(width, height, this.GP.fieldWidth/4*3, 
            (i + 1)*(this.GP.fieldHeight/(field + 1))));
        }
    }

    protected blocksCollission():void{
        const currentTime = Date.now();
        if (currentTime - this.lastCollisionTime < this.collisionCooldown) {
            return; // Exit if still in cooldown period
        }
        //collision with the blocks
        let collision = false;
        for (let block of this.blocks){
            //collision with upper horizontal:
            if (
            this.GV.ball.x - this.GP.ballRadius <= block.upperRight.x && 
            this.GV.ball.x + this.GP.ballRadius >= block.upperLeft.x && 
            this.GV.ball.y + this.GP.ballRadius >= block.upperLeft.y &&
            this.GV.ball.y < block.upperLeft.y + this.GP.ballRadius * 2 &&
            this.vector.y > 0
		    ){
                this.vector.y *= -1;
                collision = true;
            }
            //collision with lower horizontal:
            else if (
            this.GV.ball.x - this.GP.ballRadius <= block.upperRight.x && 
            this.GV.ball.x + this.GP.ballRadius >= block.upperLeft.x && 
            this.GV.ball.y - this.GP.ballRadius <= block.lowerLeft.y && 
            this.GV.ball.y > block.upperLeft.y + this.GP.ballRadius * 2 &&
            this.vector.y < 0 
            ){
                this.vector.y *= -1;
                collision = true;
            }
            if (!collision) {
                //collision with left vertical:
                if (
                this.GV.ball.y - this.GP.ballRadius <= block.lowerLeft.y &&
                this.GV.ball.y + this.GP.ballRadius >= block.upperLeft.y &&
                this.GV.ball.x - this.GP.ballRadius <= block.upperRight.x &&
                this.GV.ball.x >= block.upperRight.x - this.GP.ballRadius * 2  &&
                this.vector.x < 1
                ){
                    this.vector.x *= -1;
                    collision = true;
                }
                //collision with right vertical:
                else if (
                this.GV.ball.y - this.GP.ballRadius <= block.lowerLeft.y &&
                this.GV.ball.y + this.GP.ballRadius >= block.upperLeft.y &&
                this.GV.ball.x + this.GP.ballRadius >= block.upperLeft.x  &&
                this.GV.ball.x < block.upperLeft.x + this.GP.ballRadius * 2  &&
                this.vector.x > 1
                ){
                    this.vector.x *= -1;
                    collision = true
                }
            }
            if (collision) {
                this.lastCollisionTime = currentTime; // Update last collision time
                break; // Exit the loop after the first detected collision to avoid multiple detections in a single update
            }
        }
    }

    protected hardMode():number{
        // console.log("before blocksCollission:", this.vector.x, this.vector.y);
        this.blocksCollission();
        // console.log("after blocksCollission:", this.vector.x, this.vector.y);
        return this.collision();
    }

    protected moveBallHard():number{
        const stat:number = this.hardMode();
        if (stat < 0)
            return (stat);
        this.GV.ball.x += this.vector.x;
        this.GV.ball.y += this.vector.y;
        if (Math.sqrt(this.vector.x**2 + this.vector.y**2)<10){
            this.vector.x *= this.acceleration;
            this.vector.y *= this.acceleration;
        }
        return (1);
    }

    public gameStart():void{
            this.gameStat = 2;
            console.log("HardGame started");
            this.interval = setInterval(() =>{
            const win = this.moveBallHard();
            if (win < 0){
                if (this.gameStat === 3){
                    clearInterval(this.interval);
                    this.room.setScore(this.gameScore);
                    return ;
                }
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
    }
}

