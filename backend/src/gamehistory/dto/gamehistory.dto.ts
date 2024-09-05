export class GameHistoryDto{
    gameid: number;
  
    timestamp: Date;
  
    gametype: number;
    
    won: number;
  
    lost: number;
  
    playerA: {id: number, username: string};
  
    playerB: {id: number, username: string};
}