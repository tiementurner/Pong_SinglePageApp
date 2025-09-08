import Body from '@nestjs/common';
import { AdditionalParameter, GameParameter, Set1, Set2 } from './GameParameters';
import { GameVar } from './GameEasy';

export class Coordinate {
    x:number;
    y:number;
    constructor(x:number, y:number){
      this.x = x;
      this.y = y;
    }
  };
  
export class Par {
  paddleWidth:number;
  paddleHeight:number;
  paddleSpeed:number;
  paddleOffset:number;
  ballRadius:number;
  ballSpeed:number;
  fieldWidth:number;
  fieldHeight:number;
  gateWidth:number;
  gateDepth:number;
  
  constructor(set:GameParameter){
    this.paddleWidth = set.paddleWidth;
    this.paddleHeight = set.paddleHeight;
    this.paddleSpeed = set.paddleSpeed;
    this.ballRadius = set.ballDiameter/2;
    this.ballSpeed = set.ballSpeed;
    this.fieldWidth =set.fieldWidth;
    this.fieldHeight = set.fieldHeight;
    this.gateWidth = set.gateWidth;
    this.gateDepth = set.gateDepth;
    this.paddleOffset = set.paddleOffset;
  }
}

export class AddPar {
  blockHeight: number;
  blockWidth: number;
  middleBlocks: number;
  fieldBlocks: number;

  constructor(set:AdditionalParameter){
    this.blockHeight = set.blockHeight;
    this.blockWidth = set.blockWidth;
    this.middleBlocks = set.middleBlocks;
    this.fieldBlocks = set.fieldBlocks;
  }
}
