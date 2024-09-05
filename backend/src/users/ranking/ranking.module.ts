import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users.entity';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { UsersModule } from '../users.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
	forwardRef(() => UsersModule)
  ], 
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService]
})
export class RankingModule {}
