import { Controller, Get, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { getUser } from 'src/users/user.decorator';
import { User } from 'src/users/users.entity';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  //we have to add @UseGuard(AuthenticationGuard) and @getUser()
  //to these routes when all testing with postman is done. 

  //retrieve all friends for user :id with accepted = true
	@Get(':userid')
	@UseGuards(AuthenticationGuard)
	findFriends(
		@Param('userid', ParseIntPipe) id: number,
		@getUser() user: User
	): Promise<any> {
    	return this.friendsService.findFriends(id);
  }

  //remove friend from friendlist
	@Delete(':friendid')
	@UseGuards(AuthenticationGuard)
	remove(
		@Param('friendid', ParseIntPipe) id: number,
		@getUser() user: User
	) {
    	return this.friendsService.remove(+id);
  }
}
