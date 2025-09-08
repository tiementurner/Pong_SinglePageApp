import { Controller, Get, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FriendsService } from '../friends.service';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { User } from 'src/users/users.entity';
import { getUser } from 'src/users/user.decorator';

@Controller('friendrequest')
export class FriendRequestController {
  constructor(private readonly friendsService: FriendsService) {}

  //! check if these are still being used or if the friendService is accessed straight through the notification gateway (for all of these routes)
  //retrieve all friend requests for user :id
	@Get(':userid')
	@UseGuards(AuthenticationGuard)
	findRequests(
		@Param('userid') id: string,
		@getUser() user: User
	): Promise<any> {
    	return this.friendsService.getRequests(+id);
  	}

  //accept friend request: toggle boolean accepted to true
	@Patch(':friendid')
	@UseGuards(AuthenticationGuard)
	accept(
		@Param('friendid') id: string,
		@getUser() user: User
	) {
    	return this.friendsService.accept(+id);
  }

  //reject a friend request
	@Delete(':friendid')
	@UseGuards(AuthenticationGuard)
	remove(
		@Param('friendid') id: string,
		@getUser() user: User
	) {
		return this.friendsService.remove(+id);
	}
}
