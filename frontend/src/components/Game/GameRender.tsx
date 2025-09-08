import React from 'react';

class Coordinate {
    x:number;
    y:number;
    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
};

class Render {
    protected fieldWidth:number;
    protected fieldHeight:number;
    protected lineWidth:number;
    protected paddleWidth:number;
    protected paddleHeight:number;
    protected paddleColor:string;
    protected ballDiameter:number;
    protected ballColor:string;
    protected lineColor:string;
    protected gateWidth:number;
    protected gateDepth:number;
    protected paddleOffset:number;
    protected scale:number;

    constructor(fieldWidth:number, fieldHeight:number,
        divisionLineWidth:number, lineColor:string, paddleWidth:number, 
        paddleHeight:number, paddleColor:string, 
        ballDiameter:number, ballColor:string, gateWidth:number, 
        gateDepth:number, paddleOffset:number, scale:number){
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.lineWidth = divisionLineWidth;
            this.paddleWidth = paddleWidth;
            this.paddleHeight = paddleHeight;   
            this.paddleColor = paddleColor;
            this.ballDiameter= ballDiameter;
            this.ballColor=ballColor;
            this.lineColor=lineColor;
            this.gateWidth=gateWidth;
            this.gateDepth=gateDepth;
            this.paddleOffset= paddleOffset;
            this.scale = scale;
        };


    protected renderScore(scoreA:number, scoreB:number){
        return(
            <div className='Score' style={{
                color:this.lineColor,
                fontSize:`${this.fieldHeight/16}`,
                display:'flex',
                textAlign:'center'
            }}>
            <p>{scoreA}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{scoreB}</p>
            </div>
        );
    }

    protected startInstruction():JSX.Element{
        return (
        <div className='child' style={{
            textAlign: 'center',
            color: 'white',
            fontSize: `${this.fieldHeight/8}px`,
            fontWeight: 'bold',
            display:'flex',
            alignItems: 'center',
            justifyContent:'center'
          }}>
            <p>Press Enter to Start</p>
        </div>)
    }

    protected gameOver():JSX.Element{
        return (
        <div className='child' style={{
            textAlign: 'center',
            color: 'white',
            fontSize: `${this.fieldHeight/8}px`,
            fontWeight: 'bold',
            display:'flex',
            alignItems: 'center',
            justifyContent:'center'
          }}>
            <p>GameOver</p>
        </div>)
    }

    protected waiting():JSX.Element{
        return (
        <div className='child' style={{
            textAlign: 'center',
            color: 'white',
            fontSize: `${this.fieldHeight/8}px`,
            fontWeight: 'bold',
            display:'flex',
            alignItems: 'center',
            justifyContent:'center'
          }}>
            <p>Waiting...</p>
        </div>
        );
    }

    protected reconnecting():JSX.Element{
        return (
        <div className='child' style={{
            textAlign: 'center',
            color: 'white',
            fontSize: `${this.fieldHeight/8}px`,
            fontWeight: 'bold',
            display:'flex',
            alignItems: 'center',
            justifyContent:'center'
          }}>
            <p>Reconnecting</p>
        </div>
        );
    }

    protected dottedLine():JSX.Element{
        return(
            <div className='dottedLine' style={{
                position:'absolute' as 'absolute',
                height:'100%',
                width:`${this.lineWidth/11}px`,
                borderLeft: `2px dotted ${this.lineColor}`,
                left:'50%',
                transform: 'translateX(-50%)'
            }}></div>
        );
    }

    protected drawPaddle(paddle:Coordinate):JSX.Element {
        return (
            <div className='paddle' style={{
                position:'absolute',
                left:`${paddle.x}px`,
                top: `${paddle.y}px`,
                width:`${this.paddleWidth}px`,
                height: `${this.paddleHeight}px`,
                backgroundColor:`${this.paddleColor}`
            }}>
            </div>
        )
    }

    protected drawGate(position:string):JSX.Element{
        return (
            <div className='gates' style={{
                backgroundColor:'black',
                position:'absolute',
                width:`${this.gateDepth}px`,
                height:`${this.gateWidth}px`,
                left:`${position==='left'?0:(this.fieldWidth+this.gateDepth)}px`,
                top:`${(this.fieldHeight-this.gateWidth)/2+this.gateDepth}px`
            }}>
                </div>
        )
    }


    protected drawBall(ball:Coordinate):JSX.Element{
        return(
            <div className='ball' style={{
                position:'absolute',
                left:`${ball.x-this.ballDiameter/2}px`,
                top: `${ball.y-this.ballDiameter/2}px`,
                width:`${this.ballDiameter}px`,
                height: `${this.ballDiameter}px`,
                backgroundColor:`${this.ballColor}`
            }}>
            </div>
        );
    }

    protected renderChoice(choice:number):JSX.Element{
        if (choice=== 0)
            return(this.startInstruction());
        else if(choice === 3) 
            return(this.gameOver());
        else if (choice === 5)
            return(this.reconnecting());
        else
            return(this.waiting());
    }

    public drawStatic(choice:number, scoreA:number, scoreB:number):JSX.Element{
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
				{this.renderChoice(choice)}
				{this.drawPaddle(new Coordinate(this.paddleOffset, this.fieldHeight/2-this.paddleHeight/2))}
				{this.drawPaddle(new Coordinate(this.fieldWidth-this.paddleOffset - this.paddleWidth, this.fieldHeight/2-this.paddleHeight/2))}
            </div>
            </div>
        </div>);
    }


    public drawGame(ball:Coordinate, PaddleA:number, PaddleB:number, scoreA:number, scoreB:number){
        return(
        <div className='playfield' style={{ transform: `scale(${this.scale})`, justifyContent:'center', alignItems:"center"}}>
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
        {this.drawBall(ball)}
        {this.drawPaddle(new Coordinate(this.paddleOffset, PaddleA))}
        {this.drawPaddle(new Coordinate(this.fieldWidth-this.paddleOffset- this.paddleWidth, PaddleB))}
        </div>
        </div>  
    </div>);
    }
};



export {Render, Coordinate};