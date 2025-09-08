import { Injectable } from '@nestjs/common';
import { CreateGameHistoryDto } from './dto/create-gamehistory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { GameHistory } from './entities/gamehistory.entity';
import { GameHistoryDto } from './dto/gamehistory.dto';
import { User } from '../users/users.entity';
import { StatsHistoryData } from './gamehistory.controller';
import { RankingService } from 'src/users/ranking/ranking.service';
// import { WinsLossesDrawsDto } from './winlossdraw/dto/winslosssesdraws.dto';

@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(GameHistory)
    private readonly gameHistoryRepository: Repository<GameHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
	private readonly rankingService: RankingService
  ) {}

  async saveGameHistory(gType: number, playerAId: number, playerBId: number, scorePlayerA: number, scorePlayerB: number) {
    if (playerAId == 0 || playerBId == 0)
        return;
    let playerwon: number;
    let playerlost: number;
    if (scorePlayerA > scorePlayerB){
        playerwon = playerAId;
        playerlost = playerBId;
    }
    if (scorePlayerB > scorePlayerA) {
      playerwon = playerBId;
      playerlost = playerAId;
    }
    const newGameHistoryDto: CreateGameHistoryDto = {
      gametype: gType,
      playerA: {id: playerAId} as User,
      playerB: {id: playerBId} as User,
      won: playerwon,
      lost: playerlost
    };
    const newGameHistory = this.gameHistoryRepository.create({...newGameHistoryDto});
		await this.gameHistoryRepository.save(newGameHistory);
  }

  async findAll(findid: number) {
    const matches = await this.gameHistoryRepository.createQueryBuilder("game")
    .leftJoin("game.playerA", "playerOne")
    .addSelect(["playerOne.id", "playerOne.username"])
    .leftJoin("game.playerB", "playerTwo")
    .addSelect(["playerTwo.id", "playerTwo.username"])
    .where("playerOne.id = :findid", {findid})
    .orWhere("playerTwo.id = :findid", {findid})
    .orderBy("game.timestamp", "DESC")
    .getMany()

    const filteredMatches = matches.map((match: any) => {
      if (match.won === findid)
        match.won = true;
      else
        match.won = false
      return match
    })
    return filteredMatches    
  }

  async getWins(id: number): Promise<number> {
	return await this.gameHistoryRepository.createQueryBuilder("game")
    .where("game.won = :id", {id})
    .getCount()
  }

  async getLosses(id: number): Promise<number> {
	return await this.gameHistoryRepository.createQueryBuilder("game")
    .where("game.lost = :id", {id})
    .getCount()
  }

  async tallyWinsLossesDraws(findid: number): Promise<{total: number, wins: number, losses: number, draws: number}> {
    const wins: number = await this.gameHistoryRepository.createQueryBuilder("game")
    .where("game.playerAId = :findid", {findid})
    .andWhere("game.scoreA > game.scoreB")
    .orWhere("game.playerBId = :findid", {findid})
    .andWhere("game.scoreB > game.scoreA")
    .getCount()
    const losses: number = await this.gameHistoryRepository.createQueryBuilder("game")
    .where("game.playerAId = :findid", {findid})
    .andWhere("game.scoreA < game.scoreB")
    .orWhere("game.playerBId = :findid", {findid})
    .andWhere("game.scoreB < game.scoreA")
    .getCount()
    const draws: number = await this.gameHistoryRepository.createQueryBuilder("game")
    .where("game.playerAId = :findid", {findid})
    .andWhere("game.scoreA = game.scoreB")
    .orWhere("game.playerBId = :findid", {findid})
    .andWhere("game.scoreB = game.scoreA")
    .getCount()
	const total = wins + losses + draws;
    return {total, wins, losses, draws};
  }

  async getPublic(id: number): Promise<StatsHistoryData> {
	let data: StatsHistoryData = {
		matches: await this.findAll(id),
		wins: await this.getWins(id),
		losses: await this.getLosses(id),
		rank: await this.rankingService.getRankById(id),
		total: 0
	};
	data.total = data.matches.length;
	return data;
  }

}
