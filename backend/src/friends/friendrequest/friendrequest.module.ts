import { Module } from '@nestjs/common';
import { FriendRequestController } from './friendrequest.controller';
import { FriendsModule } from '../friends.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[FriendsModule, UsersModule],
  controllers: [FriendRequestController],
})
export class FriendRequestModule {}
