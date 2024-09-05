//the backend should push to frontend to know what to render

export interface GameParameter {
    fieldWidth:number,
    fieldHeight:number,
    paddleWidth: number;
    paddleHeight: number;
    paddleSpeed: number;
    ballDiameter: number;
    ballSpeed: number;
    gateWidth: number,
    gateDepth: number,
    paddleOffset: number
};

export interface AdditionalParameter{
    blockHeight: number,
    blockWidth: number,
    middleBlocks: number,
    fieldBlocks: number
}

export const Set1:GameParameter = {
    fieldWidth:400,
    fieldHeight:200,
    paddleWidth: 10,
    paddleHeight: 40,
    paddleSpeed: 1,
    ballDiameter: 10,
    ballSpeed: 5,
    gateWidth: 80,
    gateDepth: 20,
    paddleOffset: 10
}

export const Set2:GameParameter = {
    fieldWidth:400,
    fieldHeight:200,
    paddleWidth: 10,
    paddleHeight: 40,
    paddleSpeed: 1,
    ballDiameter: 10,
    ballSpeed: 10,
    gateWidth: 200,
    gateDepth: 20,
    paddleOffset: 10,
}

export const Set2Add: AdditionalParameter ={
    blockHeight: 10,
    blockWidth: 60,
    middleBlocks: 4,
    fieldBlocks: 2
}