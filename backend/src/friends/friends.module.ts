import { Module, forwardRef } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { User } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User]),
   			//TypeOrmModule.forFeature([User]),
			forwardRef(() => UsersModule)],
  controllers: [FriendsController],
  providers: [
	FriendsService
],
  exports: [FriendsService]
})
export class FriendsModule {}
