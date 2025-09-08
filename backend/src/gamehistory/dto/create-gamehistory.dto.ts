import { User } from "src/users/users.entity";

export class CreateGameHistoryDto{
    gametype: number;
    
    won: number;
  
    lost: number;
  
    playerA: User;
  
    playerB: User;
}