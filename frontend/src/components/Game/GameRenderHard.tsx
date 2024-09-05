import { Render } from './GameRender'
import { Coordinate } from './GameRender';
import React from 'react';

export class  Block {
    upperLeft:Coordinate;
    upperRight:Coordinate;
    lowerLeft:Coordinate;
    lowerRight:Coordinate;
    constructor(width:number, height:number, x:number, y:number){
        this.upperLeft = new Coordinate(x-width/2, y - height/2);
        this.upperRight = new Coordinate(x+width/2, y -height/2);
        this.lowerLeft = new Coordinate(x-width/2, y+height/2);
        this.lowerRight = new Coordinate(x-width/2, y+height/2);
    }
}

export class RenderLevel2 extends Render{
    protected blocks:Block[] = [];
    protected middleBlocks:number;
    protected fieldBlocks:number;
    protected blockWidth:number;
    protected blockHeight:number;
    
    constructor(fieldWidth:number, fieldHeight:number,
        divisionLineWidth:number, lineColor:string, paddleWidth:number, 
        paddleHeight:number, paddleColor:string, 
        ballDiameter:number, ballColor:string, gateWidth:number, 
        gateDepth:number, paddleOffset:number, scale:number, 
        middleBlocks:number, fieldBlocks:number, blockWidth:number, 
        blockHeight:number){
            super(
            fieldWidth,
            fieldHeight,
            divisionLineWidth,
            lineColor,
            paddleWidth,
            paddleHeight,  
            paddleColor,
            ballDiameter,
            ballColor,
            gateWidth,
            gateDepth,
            paddleOffset,
            scale);

        this.middleBlocks = middleBlocks;
        this.fieldBlocks = fieldBlocks;
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;

        for (let i = 0; i < middleBlocks; i+=1){
            this.blocks.push(new Block(blockWidth, blockHeight, this.fieldWidth/2, 
            (i+1)* this.fieldHeight/(middleBlocks+1)));
        }
        for (let i = 0; i < fieldBlocks; i +=1){
            this.blocks.push(new Block(blockWidth, blockHeight, this.fieldWidth/4, 
            (i+1)*(this.fieldHeight/(fieldBlocks + 1))));
        }
        for (let i = 0; i < fieldBlocks; i +=1){
            this.blocks.push(new Block(blockWidth, blockHeight, this.fieldWidth/4*3, 
            (i+1)*(this.fieldHeight/(fieldBlocks + 1))));
        }
    }

    protected drawBlocks():JSX.Element{
        const recs = this.blocks.map((block)=>(
            <div style ={{
                position: `absolute`,
                left:`${block.upperLeft.x}px`,
                top: `${block.upperLeft.y}px`,
                width: `${this.blockWidth}px`, 
                height: `${this.blockHeight}px`,
                backgroundColor: this.paddleColor,
                }}></div>
            ));
        return (
            <div>
                {recs}
            </div>
        );
    }
    
    public drawGame(ball:Coordinate, PaddleA:number, PaddleB:number, scoreA:number, scoreB:number){
        return(
            <div className='playfield' style={{ transform: `scale(${this.scale})`}}>
            <div className='startScreen' 
            style={{
                position:'relative',
                width: `${this.fieldWidth+this.gateDepth*2}px`,
                height: `${this.fieldHeight+this.gateDepth*2}px`,
                backgroundColor:`${this.lineColor}`,
                display:'flex',
                flexDirection:'column',
                justifyContent:'center',
                alignItems:'center'
            }}> 
            {this.drawGate('left')}
            {this.drawGate('right')}
            <div className='inner_rectangle' style={{
                position:'relative',
                width: `${this.fieldWidth}px`,
                height: `${this.fieldHeight}px`,
                backgroundColor:'black',
                display:'flex',
                flexDirection:'column',
                justifyContent:'top',
                alignItems:'center'
            }}>
            {this.dottedLine()}
            {this.renderScore(scoreA, scoreB)}
            {this.drawBlocks()}
            {this.drawBall(ball)}
            {this.drawPaddle(new Coordinate(this.paddleOffset, PaddleA))}
            {this.drawPaddle(new Coordinate(this.fieldWidth-this.paddleOffset- this.paddleWidth, PaddleB))}
            </div>
            </div>  
        </div>);
        };
}