import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';
import { RankingDto } from './ranking.dto';

@Injectable()
export class RankingService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getLeaderboard(): Promise<User[]> {
    return await this.userRepository.find({
    select: {
      id: true,
      username: true,
      score: true
    },
		order: {
			score: "DESC"
		},
		take: 10
	});
  }

  async getRankById(id: number): Promise<string> {
	const user = await this.userRepository.findOne({
		where: { id: id },
		select: ['score']
	  });
	
	  
	  if (user.score < 5) {
		return "Novice";
	  } else if (user.score < 10){
		return "Intermediate"; 
	  } else if (user.score < 20){
		return "Semi-pro" 
	  } else if (user.score < 30){
		return "Pro"
	  } else {
		return "Transcended"
	  }
  }

  async increaseScore(userId: number, increase: number) {
    return this.userRepository.increment({id: userId}, "score", increase);
    }
}
