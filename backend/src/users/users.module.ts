import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { RankingModule } from './ranking/ranking.module';
import { AvatarModule } from './avatar/avatar.module';
import { ProfileModule } from './profile/profile.module';
import { FriendsModule } from 'src/friends/friends.module';
import { Friend } from 'src/friends/entities/friend.entity';
import { GameHistoryModule } from 'src/gamehistory/gamehistory.module';
import { ChannelModule } from 'src/chat/channels/channel.module';

@Module({
	imports:[
		TypeOrmModule.forFeature([User, Friend]),
		RankingModule,
		AvatarModule,
		ProfileModule,
		FriendsModule,
		GameHistoryModule,
		forwardRef(() => ChannelModule)
	], 
  controllers: [UsersController],
  providers: [
	UsersService],
  exports: [UsersService]
})
export class UsersModule {}