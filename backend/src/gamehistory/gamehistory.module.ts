import { Module, forwardRef } from '@nestjs/common';
import { GameHistoryService } from './gamehistory.service';
import { GameHistoryController } from './gamehistory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistory } from './entities/gamehistory.entity';
import { User } from '../users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { RankingModule } from 'src/users/ranking/ranking.module';

@Module({
  imports:[ TypeOrmModule.forFeature([GameHistory, User]),
  			forwardRef(() => UsersModule),
			RankingModule	
		], 
  controllers: [GameHistoryController],
  providers: [GameHistoryService],
  exports: [GameHistoryService]
})
export class GameHistoryModule {}
